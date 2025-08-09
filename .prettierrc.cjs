/** @type {import('@types/prettier').Config} */
module.exports = {
	semi: true,
	tabWidth: 2,
	useTabs: true,
	printWidth: 120,
	endOfLine: 'auto',
	singleQuote: true,
	arrowParens: 'avoid',
	bracketSpacing: true,
	trailingComma: 'none',
	quoteProps: 'as-needed',
	jsxBracketSameLine: false,
	overrides: [
		{
			files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
			options: {
				parser: 'typescript',
			},
		},
	],
};
