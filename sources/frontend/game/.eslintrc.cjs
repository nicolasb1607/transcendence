module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:@typescript-eslint/recommended',
	],
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	rules: {
		"indent": ["error", "tab"],//Code style
		"prefer-arrow-callback": "error",//Code style
		"arrow-spacing": [
			"error",
			{ "before": true, "after": true }
		],//Code style
		"no-array-constructor": "error",//Code style
		"no-new-object": "error",//Code style
		"@typescript-eslint/no-namespace": "off",
		'@typescript-eslint/no-explicit-any': 'error',
		"@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],//Performance
		"no-restricted-syntax": [
			"error",
			{
				"selector": "JSXElement > JSXExpressionContainer > LogicalExpression[operator!='??']",//Disallow && operator
				"message": "Use of && operator is disallowed. Use ternary operator instead."
			}
		],
		"prefer-const": "error",//This ensures that you can’t reassign your references, which can lead to bugs and difficult to comprehend code.
		"no-const-assign": "error",//This rule is aimed at eliminating variables that are declared using const keyword, but are reassigned after declared.
		"no-var": "error",//let is block-scoped rather than function-scoped like var.
		"object-shorthand": "error",//Prefer the object spread syntax over Object.assign to shallow-copy objects.
	},
	settings: {
	},
	env: {
		"jest": true
	}
}