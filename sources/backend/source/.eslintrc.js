module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: [
		'plugin:@typescript-eslint/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: [
		'.eslintrc.js',
		'dist',
		'client'
	],
	rules: {
		"indent": ["error", "tab"],//Code style
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'error',
		"arrow-spacing": [
			"error",
			{ "before": true, "after": true }
		],//Code style
		"no-array-constructor": "error",//Code style
		"no-new-object": "error",
		"@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],//Performance
		"prefer-const": "error",//This ensures that you can’t reassign your references, which can lead to bugs and difficult to comprehend code.
		"no-const-assign": "error", //This rule is aimed at eliminating variables that are declared using const keyword, but are reassigned after declared.
		"no-var": "error",//let is block-scoped rather than function-scoped like var.
		"object-shorthand": "error",//Prefer the object spread syntax over Object.assign to shallow-copy objects.
	},
};
