/* BLE -> WebSocket bridge for OBS.
   Broadcasts JSON: { type:'hr', bpm, rrIntervals, contactDetected, energyExpended, ts }
   Battery: { type:'battery', level }
*/
const process = require('node:process');
const noble = require('@abandonware/noble');
const { WebSocketServer } = require('ws');

const HR_SERVICE = '180d';
const HR_MEAS = '2a37';
const BATT_SERVICE = '180f';
const BATT_LEVEL = '2a19';

const PORT = process.HR_BRIDGE_PORT ? Number(process.HR_BRIDGE_PORT) : 8765;
const NAME_HINT = (process.HR_DEVICE_NAME || 'tickr').toLowerCase();

const clients = new Set();
let connectedPeripheral = null;
let lastReading = null;
let lastBattery = null;

const wss = new WebSocketServer({ port: PORT }, () =>
	console.log(`[hr-bridge] WebSocket listening ws://127.0.0.1:${PORT}`));

wss.on('connection', (ws) => {
	clients.add(ws);
	ws.on('close', () => clients.delete(ws));
	ws.send(JSON.stringify({ type: 'bridge/status', hrConnected: !!connectedPeripheral }));
	if (lastBattery)
		ws.send(JSON.stringify({ type: 'battery', level: lastBattery }));
	if (lastReading)
		ws.send(JSON.stringify({ type: 'hr', ...lastReading }));
});

function broadcast(obj) {
	const msg = JSON.stringify(obj);
	for (const ws of clients) {
		if (ws.readyState === 1)
			ws.send(msg);
	}
}

function parseHrMeasurement(buf) {
	const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	const flags = dv.getUint8(0);
	let offset = 1;

	const isUint16 = (flags & 0x01) !== 0;
	const bpm = isUint16 ? dv.getUint16(offset, true) : dv.getUint8(offset);
	offset += isUint16 ? 2 : 1;

	let contactDetected = null;
	const contactFlag = (flags >> 1) & 0x03;
	if (contactFlag === 0b10)
		contactDetected = false;
	if (contactFlag === 0b11)
		contactDetected = true;

	let energyExpended = null;
	if (flags & 0x08) {
		energyExpended = dv.getUint16(offset, true);
		offset += 2;
	}

	const rrIntervals = [];
	if (flags & 0x10) {
		while (offset + 1 < dv.byteLength) {
			const rr = dv.getUint16(offset, true);
			offset += 2;
			rrIntervals.push(rr / 1024); // seconds
		}
	}

	return { bpm, rrIntervals, contactDetected, energyExpended, ts: Date.now() };
}

async function connectPeripheral(peripheral) {
	console.log(`[hr-bridge] Connecting to ${peripheral.advertisement.localName || peripheral.id}`);
	await peripheral.connectAsync();
	connectedPeripheral = peripheral;

	peripheral.once('disconnect', () => {
		console.log('[hr-bridge] Disconnected');
		connectedPeripheral = null;
		broadcast({ type: 'bridge/status', hrConnected: false });
		startScanning().catch(() => {});
	});

	const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
		[HR_SERVICE, BATT_SERVICE],
		[HR_MEAS, BATT_LEVEL],
	);

	const hrChar = characteristics.find(c => c.uuid === HR_MEAS);
	if (!hrChar)
		throw new Error('Heart Rate Measurement characteristic not found');

	hrChar.on('data', (data) => {
		lastReading = parseHrMeasurement(data);
		broadcast({ type: 'hr', ...lastReading });
	});
	await hrChar.subscribeAsync();
	broadcast({ type: 'bridge/status', hrConnected: true });

	const battChar = characteristics.find(c => c.uuid === BATT_LEVEL);
	if (battChar) {
		try {
			const data = await battChar.readAsync();
			lastBattery = data.readUInt8(0);
			broadcast({ type: 'battery', level: lastBattery });
			// Some devices notify battery; try subscribe (best-effort)
			try {
				await battChar.subscribeAsync();
				battChar.on('data', (d) => {
					lastBattery = d.readUInt8(0);
					broadcast({ type: 'battery', level: lastBattery });
				});
			}
			catch {}
		}
		catch {}
	}

	console.log('[hr-bridge] Subscribed to HR notifications');
}

async function startScanning() {
	if (connectedPeripheral)
		return;
	console.log('[hr-bridge] Scanning for HR devices…');
	await noble.startScanningAsync([HR_SERVICE], false);

	noble.once('discover', async (peripheral) => {
		const name = (peripheral.advertisement.localName || '').toLowerCase();
		const hasHrService = (peripheral.advertisement.serviceUuids || []).includes(HR_SERVICE);
		if (!hasHrService && !name.includes(NAME_HINT))
			return;

		try {
			await noble.stopScanningAsync();
			await connectPeripheral(peripheral);
		}
		catch (e) {
			console.error('[hr-bridge] Connect failed:', e.message || e);
			setTimeout(() => startScanning().catch(() => {}), 2000);
		}
	});
}

noble.on('stateChange', async (state) => {
	console.log('[hr-bridge] Adapter state:', state);
	if (state === 'poweredOn') {
		startScanning().catch(e => console.error(e));
	}
	else {
		try {
			await noble.stopScanningAsync();
		}
		catch {}
	}
});
