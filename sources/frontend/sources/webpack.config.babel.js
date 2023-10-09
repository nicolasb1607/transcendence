import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import Dotenv from "dotenv-webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __client_dirname = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "../../client") : path.resolve(__dirname, "../../backend/source/client");
const cssBundleName = process.env.NODE_ENV === "production" ? "[hash:base64]" : "[name]__[local]--[hash:base64:5]";

export default {
	mode: "development",
	entry: "./src/index.tsx",
	output: {
		path: __client_dirname,
		filename: "[name].js",
		chunkFilename: "[name].bundle.js",
		publicPath: "/",
	},
	devServer: {
		historyApiFallback: true,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				loader: "babel-loader",
			},
			{
				test: /\.module\.css$/,
				use: ["style-loader", {
					loader: "css-loader",
					options: {
						importLoaders: 1,
						modules: {
							localIdentName: cssBundleName
						},
					}
				}],
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
		fallback: {
			"crypto": false
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html'
		}),
		new CopyPlugin({
			patterns: [
				{ from: "./public", to: __client_dirname },
				{ from: "./public/avatars", to: `${__client_dirname}/avatars`},
			]
		}),
		new Dotenv()
	]
}