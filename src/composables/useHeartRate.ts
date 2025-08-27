/// <reference types="web-bluetooth" />
import { ref } from 'vue';

type HeartRateReading = {
	bpm: number | null;
	rrIntervals: number[];
	contactDetected: boolean | null;
	energyExpended: number | null;
};

const HEART_RATE_SERVICE = 'heart_rate';
const HEART_RATE_MEASUREMENT = 'heart_rate_measurement';
const BATTERY_SERVICE = 'battery_service';
const BATTERY_LEVEL = 'battery_level';

function isObs() {
	if (typeof navigator === 'undefined')
		return false;
	return /OBS/i.test(navigator.userAgent) || (window as any).obsstudio;
}

export function useHeartRate() {
	const supportedBT = typeof navigator !== 'undefined' && !!navigator.bluetooth;
	const bridgeUrl
		= import.meta.env.VITE_HR_BRIDGE_URL
			|| (isObs() ? 'ws://127.0.0.1:8765' : '');

	const mode: 'bridge' | 'web' = bridgeUrl ? 'bridge' : 'web';

	const connecting = ref(false);
	const connected = ref(false);
	const error = ref<string | null>(null);

	const reading = ref<HeartRateReading>({
		bpm: null,
		rrIntervals: [],
		contactDetected: null,
		energyExpended: null,
	});
	const batteryLevel = ref<number | null>(null);

	// Web Bluetooth state
	let device: BluetoothDevice | null = null;
	let server: BluetoothRemoteGATTServer | null = null;
	let measurementChar: BluetoothRemoteGATTCharacteristic | null = null;

	// Bridge state
	let ws: WebSocket | null = null;
	let retryTimer: any = null;

	function parseMeasurement(value: DataView) {
		const flags = value.getUint8(0);
		let offset = 1;

		const isUint16 = (flags & 0x01) !== 0;
		const bpm = isUint16 ? value.getUint16(offset, true) : value.getUint8(offset);
		offset += isUint16 ? 2 : 1;

		let contactDetected: boolean | null = null;
		const contactFlag = (flags >> 1) & 0x03;
		if (contactFlag === 0b10)
			contactDetected = false;
		if (contactFlag === 0b11)
			contactDetected = true;

		let energyExpended: number | null = null;
		if ((flags & 0x08) !== 0) {
			energyExpended = value.getUint16(offset, true);
			offset += 2;
		}

		const rrIntervals: number[] = [];
		if ((flags & 0x10) !== 0) {
			while (offset + 1 < value.byteLength) {
				const rr = value.getUint16(offset, true);
				offset += 2;
				rrIntervals.push(rr / 1024);
			}
		}

		reading.value = { bpm, rrIntervals, contactDetected, energyExpended };
	}

	async function readBatteryLevel(svc: BluetoothRemoteGATTService) {
		try {
			const char = await svc.getCharacteristic(BATTERY_LEVEL);
			const val = await char.readValue();
			batteryLevel.value = val.getUint8(0);
		}
		catch {}
	}

	async function setupNotifications(gatt: BluetoothRemoteGATTServer) {
		const hrService = await gatt.getPrimaryService(HEART_RATE_SERVICE);
		measurementChar = await hrService.getCharacteristic(HEART_RATE_MEASUREMENT);
		measurementChar.addEventListener('characteristicvaluechanged', (evt: Event) => {
			const dv = (evt.target as BluetoothRemoteGATTCharacteristic).value!;
			parseMeasurement(dv);
		});
		await measurementChar.startNotifications();

		try {
			const battService = await gatt.getPrimaryService(BATTERY_SERVICE);
			await readBatteryLevel(battService);
			try {
				const battChar = await battService.getCharacteristic(BATTERY_LEVEL);
				await battChar.startNotifications();
				battChar.addEventListener('characteristicvaluechanged', (e: Event) => {
					const dv = (e.target as BluetoothRemoteGATTCharacteristic).value!;
					batteryLevel.value = dv.getUint8(0);
				});
			}
			catch {}
		}
		catch {}
	}

	// Web Bluetooth connect
	async function connectWeb() {
		error.value = null;
		if (!supportedBT) {
			error.value = 'Web Bluetooth not available in this browser.';
			return;
		}
		if (connected.value || connecting.value)
			return;

		try {
			connecting.value = true;
			device = await navigator.bluetooth.requestDevice({
				filters: [{ services: [HEART_RATE_SERVICE] }],
				optionalServices: [BATTERY_SERVICE, 'device_information'],
			});

			device.addEventListener('gattserverdisconnected', handleDisconnectWeb);
			server = await device.gatt!.connect();
			await setupNotifications(server);
			connected.value = true;
		}
		catch (e: any) {
			error.value = e?.message || String(e);
			await disconnect();
		}
		finally {
			connecting.value = false;
		}
	}

	async function handleDisconnectWeb() {
		connected.value = false;
		if (device?.gatt && !server?.connected) {
			try {
				connecting.value = true;
				server = await device.gatt.connect();
				await setupNotifications(server);
				connected.value = true;
			}
			catch {
				// silent
			}
			finally {
				connecting.value = false;
			}
		}
	}

	// Bridge connect
	function connectBridge() {
		if (!bridgeUrl || ws)
			return;
		connecting.value = true;
		error.value = null;

		ws = new WebSocket(bridgeUrl);
		ws.onopen = () => {
			connecting.value = false;
			// Connection to bridge does not guarantee HR strap is connected; we rely on status messages.
		};
		ws.onmessage = (ev) => {
			try {
				const msg = JSON.parse(ev.data);
				if (msg.type === 'hr') {
					reading.value = {
						bpm: msg.bpm ?? null,
						rrIntervals: Array.isArray(msg.rrIntervals) ? msg.rrIntervals : [],
						contactDetected: typeof msg.contactDetected === 'boolean' ? msg.contactDetected : null,
						energyExpended: typeof msg.energyExpended === 'number' ? msg.energyExpended : null,
					};
				}
				else if (msg.type === 'battery') {
					batteryLevel.value = typeof msg.level === 'number' ? msg.level : null;
				}
				else if (msg.type === 'bridge/status') {
					connected.value = !!msg.hrConnected;
				}
			}
			catch {
				// ignore
			}
		};
		ws.onclose = () => {
			connected.value = false;
			ws = null;
			connecting.value = false;
			// Reconnect with backoff
			clearTimeout(retryTimer);
			retryTimer = setTimeout(connectBridge, 1500);
		};
		ws.onerror = () => {
			error.value = 'Bridge error';
		};
	}

	async function connect() {
		if (mode === 'bridge') {
			connectBridge();
		}
		else {
			await connectWeb();
		}
	}

	async function disconnect() {
		try {
			if (mode === 'bridge') {
				clearTimeout(retryTimer);
				if (ws && ws.readyState === WebSocket.OPEN)
					ws.close();
				ws = null;
			}
			else {
				measurementChar?.stopNotifications().catch(() => {});
				if (device?.gatt?.connected)
					device.gatt.disconnect();
			}
		}
		finally {
			connected.value = false;
		}
	}

	async function tryAutoConnect() {
		if (mode === 'bridge') {
			connectBridge();
			return;
		}
		if (!supportedBT)
			return;
		const anyNav = navigator as any;
		if (typeof anyNav.bluetooth?.getDevices !== 'function')
			return;
		try {
			const devices: BluetoothDevice[] = await anyNav.bluetooth.getDevices();
			const candidates = devices.filter(d =>
				(d as any).uuids?.includes('0000180d-0000-1000-8000-00805f9b34fb')
				|| d.name?.toLowerCase().includes('tickr'),
			);
			if (candidates.length > 0) {
				// Silent reconnect
				const d = candidates[0];
				device = d;
				d.addEventListener('gattserverdisconnected', handleDisconnectWeb);
				server = await d.gatt!.connect();
				await setupNotifications(server);
				connected.value = true;
			}
		}
		catch {
			// ignore
		}
	}

	return {
		// When in OBS/bridge mode, supportedBT might be false, but we still can connect via bridge.
		supported: mode === 'bridge' ? true : supportedBT,
		connecting,
		connected,
		error,
		reading,
		batteryLevel,
		connect,
		disconnect,
		tryAutoConnect,
		mode,
	};
}
