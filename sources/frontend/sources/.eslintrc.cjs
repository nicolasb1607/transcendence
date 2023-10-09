module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:jsx-a11y/recommended',
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
		//React
		"react/jsx-indent": [
			"error",
			"tab"
		],
		"react/no-multi-comp": "error",//Prevent multiple component definition per file
		"react/self-closing-comp": "error",//Prevent extra closing tags for components without children
		"react/jsx-pascal-case": "error",//Code style
		"react/jsx-closing-bracket-location": "error",//Code style
		"react/jsx-curly-spacing": "error",//Code style
		"react/require-render-return": "error",//Prevent missing return statements
		"react/jsx-fragments": "error",//Performance, by removing unnecessary wrapper nodes
		"jsx-a11y/alt-text": "error",//SEO & Accessibility
		"jsx-a11y/img-redundant-alt": "error",//SEO & Accessibility
		"jsx-a11y/anchor-is-valid": "off",//<Link> component pass href prop to child <a> tag
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	env: {
		"jest": true
	}
}