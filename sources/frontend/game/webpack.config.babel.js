import HtmlWebpackPlugin from "html-webpack-plugin";
import Dotenv from "dotenv-webpack";

export default {
	mode: 'development',
	entry: './src/index.ts',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'babel-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(png|jpe?g|gif|glb|gltf|mp3|svg)$/i,
				loader: 'file-loader',
				options: {
					esModule: false
				}
			},
			{
				test: /\.css$/,
				exclude: /\.module\.css$/,
				use: ["style-loader", {
					loader: "css-loader",
				}],
			}
		]
	},
	resolve: {
		extensions: [".js", ".jsx", '.ts', '.tsx'],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html'
		}),
		new Dotenv(),
	],
};