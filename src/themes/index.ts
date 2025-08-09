import defaultConfig from './default/config';

const themeName = import.meta.env.VITE_OVERLAY_THEME || 'default';

console.log(`Loading theme: ${themeName}`);

// Dynamically import the theme CSS
if (themeName !== 'default') {
	import(`./${themeName}/theme.css`);
}

let logoPath = `/src/themes/${themeName}/logo.svg`;
try {
	// Optionally check if logo exists, else fallback
	// (You may need to handle this with Vite's asset handling)
}
catch {
	logoPath = defaultConfig.settings.logo;
}

let themeConfig = defaultConfig;
if (themeName !== 'default') {
	// Load custom theme configuration if it exists
	try {
		const customConfig = await import(`./${themeName}/config.ts`);
		themeConfig = customConfig.default;
	}
	catch {
		console.warn(`Theme '${themeName}' not found, using default theme`);
	}
}

export default {
	...themeConfig,
	logo: logoPath,
};
