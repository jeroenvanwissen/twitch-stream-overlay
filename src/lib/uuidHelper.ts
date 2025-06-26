import { UAParser } from 'ua-parser-js';
import md5 from 'md5';

export interface UUID {
	agent: string;
	parser: Parser;
	screen: Screen;
	browser: Browser;
	device: AppAgent | null;
	cpu: CPU;
	os: OS;
	get: Get;
}

export interface Browser {
	language: string;
	name: string;
	version: string;
	major: string;
	engine: string;
	arch: string;
	vendor: string;
}

export interface CPU {
	arch: string;
	cores: number;
}

export interface Get {
	os: OS;
	cpu: CPU;
	browser: Browser;
	screen: Screen;
	deviceId: string;
	device: AppAgent | null;
}

export interface OS {
	vendor: string;
	name: string;
	version: string;
}

export interface Screen {
	pixelDepth: number;
	// orientation: Orientation;
	width: number;
	height: number;
	isTouchScreen: boolean;
}

export interface AppAgent {
	android_version?: number;
	brand?: string;
	model?: string;
	name?: string;
}

export interface Parser {}

function createUUID() {
	class UID {
		agent: string = navigator.userAgent.replace(/^\s*/u, '').replace(/\s*$/u, '');
		parser = new UAParser();
		screen: Screen = {
			pixelDepth: screen.pixelDepth,
			width: screen.availWidth,
			height: screen.availHeight,
			isTouchScreen:
        'ontouchstart' in window
        || navigator.maxTouchPoints > 0
        // @ts-ignore
        || navigator.msMaxTouchPoints > 0,
		};

		browser: Browser = {
			language: (
				navigator.language
				// @ts-ignore
				|| navigator.userLanguage
				// @ts-ignore
				|| navigator.browserLanguage
				// @ts-ignore
				|| navigator.systemLanguage
				|| ''
			).toLowerCase(),
			engine: this.parser.getEngine().name ?? '',
			arch: navigator.platform,
			vendor: navigator.vendor,
			// @ts-ignore
			name: navigator.userAgentData?.brands?.[navigator.userAgentData?.brands.length - 2]?.brand
			// @ts-ignore
				?? navigator.userAgentData?.brands?.[navigator.userAgentData?.brands.length - 1]?.brand
				?? this.getPlatform(),
			...this.parser.getBrowser(),
			version: this.parser.getBrowser().version ?? '',
			major: this.parser.getBrowser().major ?? '',
		};

		cpu: CPU = {
			arch: this.parser.getCPU().architecture ?? '',
			cores: navigator.hardwareConcurrency,
		};

		os: OS = {
			vendor: this.getPlatform(),
			...this.parser.getOS(),
			name: this.getPlatform(),
			version: this.parser.getOS().version ?? '',
		};

		device: AppAgent = {
			android_version: undefined,
			brand: undefined,
			model: undefined,
			name: undefined,
			...this.getAppDetails(),
		};

		deviceId: string = (() => {
			const variant = 'b';
			const tmpUuid = this.hashMD5(
				[
					location.origin,
					this.os.name,
					this.os.vendor,
					this.os.version,
					this.cpu.arch,
					this.cpu.cores,
					this.browser.arch,
					this.browser.engine,
					this.browser.language,
					this.browser.major,
					this.browser.name,
					this.browser.vendor,
					this.browser.version,
					this.screen.isTouchScreen,
				].join(':'),
			);

			return [
				tmpUuid.slice(0, 8),
				tmpUuid.slice(8, 12),
				`3${tmpUuid.slice(12, 15)}`,
				variant + tmpUuid.slice(15, 18),
				tmpUuid.slice(20),
			].join('-');
		})();

		hashMD5(str: string): string {
			return md5(str);
		}

		getAppDetails() {
			const regex = /Android\s\d{1,2};\sNoMercy\sTV;\s(?<name>.+);\s(?<brand>.+);\s(?<model>.+)/iu;
			if (regex.test(navigator.userAgent)) {
				// @ts-ignore
				const groups = regex.exec(navigator.userAgent)?.groups;
				if (!groups)
					return null;

				return {
					android_version: Number.parseInt(groups.android_version, 10),
					brand: groups.brand,
					model: groups.model,
					name: groups.name,
				};
			}

			return null;
		}

		getPlatform() {
			const ua = navigator.userAgent.replace(/^\s*/, '').replace(/\s*$/, '');
			const Agent = {
				isMac: false,
				isiPad: false,
				isiPod: false,
				isiPhone: false,
				isAndroid: false,
				isAndroidTv: false,
				isBlackberry: false,
				isFirefox: false,
				isWindowsPhone: false,
				isSamsung: false,
				isLinux: false,
				isCurl: false,
			};
			const _Platform = {
				Firefox: /Firefox/i,
				Windows: /windows nt/i,
				WindowsPhone: /windows phone/i,
				Mac: /macintosh/i,
				Linux: /linux/i,
				Wii: /wii/i,
				Playstation: /playstation/i,
				iPad: /ipad/i,
				iPod: /ipod/i,
				iPhone: /iphone/i,
				Android: /android/i,
				Blackberry: /blackberry/i,
				Samsung: /samsung/i,
				Curl: /curl/i,
				AndroidTv: /Android\s(?<version>\d{1,2});\s/g,
			};
			switch (true) {
				case _Platform.Wii.test(ua):
					return 'Wii';
				case _Platform.Playstation.test(ua):
					return 'Playstation';
				case _Platform.iPad.test(ua):
					Agent.isiPad = true;
					return 'iPad';
				case _Platform.iPod.test(ua):
					Agent.isiPod = true;
					return 'iPod';
				case _Platform.iPhone.test(ua):
					Agent.isiPhone = true;
					return 'iPhone';
				case _Platform.Samsung.test(ua):
					Agent.isSamsung = true;
					return 'Samsung';
				case _Platform.Mac.test(ua):
					Agent.isMac = true;
					return 'Apple';
				case _Platform.Curl.test(ua):
					Agent.isCurl = true;
					return 'Curl';
				case _Platform.Blackberry.test(ua):
					Agent.isBlackberry = true;
					return 'Blackberry';
				case _Platform.Firefox.test(ua):
					Agent.isFirefox = true;
					return 'Firefox';
				case _Platform.Windows.test(ua):
					return 'Microsoft';
				case _Platform.WindowsPhone.test(ua):
					Agent.isWindowsPhone = true;
					return 'Microsoft Windows Phone';
				case _Platform.AndroidTv.test(ua):
					Agent.isAndroidTv = true;
					return 'Android TV';
				case _Platform.Android.test(ua):
					Agent.isAndroid = true;
					return 'Android';
				case _Platform.Linux.test(ua):
					Agent.isLinux = true;
					return 'Linux';
				default:
					return 'unknown';
			}
		}
	}

	const uid = new UID();

	return {
		os: uid.os,
		cpu: uid.cpu,
		browser: uid.browser,
		screen: uid.screen,
		deviceId: uid.deviceId,
		device: uid.device,
	};
}

export default createUUID;
