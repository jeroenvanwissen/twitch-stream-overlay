// First, update the make.cjs script
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const readline = require('node:readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const COMMANDS_DIR = path.join(__dirname, '../commands');
const REWARDS_DIR = path.join(__dirname, '../rewards');
const STUBS_DIR = path.join(__dirname, '../stubs');

function toTitleCase(str) {
	let i;
	let j;

	str = str.replace(/([^\W_][^\s-]*) */gu, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});

	// Certain minor words should be left lowercase unless
	// they are the first or last words in the string
	const lowers = [
		'A',
		'An',
		'The',
		'And',
		'But',
		'Or',
		'For',
		'Nor',
		'As',
		'At',
		'By',
		'For',
		'From',
		'In',
		'Into',
		'Near',
		'Of',
		'On',
		'Onto',
		'To',
		'With',
	];
	for (i = 0, j = lowers.length; i < j; i++) {
		str = str.replace(new RegExp(`\\s${lowers[i]}\\s`, 'gu'), (txt) => {
			return txt.toLowerCase();
		});
	}

	// Certain words such as initialisms or acronyms should be left uppercase
	const uppers = ['Id', 'Tv'];
	for (i = 0, j = uppers.length; i < j; i++) {
		str = str.replace(
			new RegExp(`\\b${uppers[i]}\\b`, 'gu'),
			uppers[i].toUpperCase(),
		);
	}

	return str;
}

function ensureDirectoryExists(directory) {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
	}
}

function makeCommand(name) {
	ensureDirectoryExists(STUBS_DIR);
	ensureDirectoryExists(COMMANDS_DIR);

	const fileName = path.join(COMMANDS_DIR, `${name}.ts`);
	if (fs.existsSync(fileName)) {
		console.error(`Command "${name}" already exists!`);
		process.exit(1);
	}

	let template = fs.readFileSync(path.join(STUBS_DIR, 'command.stub'), 'utf8');

	// Replace placeholders in the template
	template = template.replace(/\{\{name\}\}/g, name);
	template = template.replace(/\{\{titleName\}\}/g, toTitleCase(name));

	fs.writeFileSync(fileName, template);
	console.log(`Command "${name}" created at "${fileName}"`);
	process.exit();
}

function makeReward(name, id = '') {
	ensureDirectoryExists(STUBS_DIR);
	ensureDirectoryExists(REWARDS_DIR);

	const fileName = path.join(REWARDS_DIR, `${name}.ts`);
	if (fs.existsSync(fileName)) {
		console.error(`Reward "${name}" already exists!`);
		process.exit(1);
	}

	let template = fs.readFileSync(path.join(STUBS_DIR, 'reward.stub'), 'utf8');

	// Replace placeholders in the template
	template = template.replace(/\{\{name\}\}/g, name);
	template = template.replace(/\{\{titleName\}\}/g, toTitleCase(name));
	template = template.replace(/\{\{id\}\}/g, id);

	fs.writeFileSync(fileName, template);
	console.log(`Reward "${name}" created at "${fileName}"`);
	process.exit();
}

const type = process.argv[2];
const name = process.argv[3];

if (type === 'command') {
	if (!name) {
		rl.question('Command name: ', (cmdName) => {
			makeCommand(cmdName);
			rl.close();
		});
	}
	else {
		makeCommand(name);
	}
}
else if (type === 'reward') {
	if (!name) {
		rl.question('Reward name: ', (rewardName) => {
			rl.question('Reward ID (optional): ', (rewardId) => {
				makeReward(rewardName, rewardId);
				rl.close();
			});
		});
	}
	else {
		const id = process.argv[4] || '';
		makeReward(name, id);
	}
}
else {
	console.error('Usage: node make.js command <name>');
	console.error('       node make.js reward <name> [id]');
	process.exit(1);
}
