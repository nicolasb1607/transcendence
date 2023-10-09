import path from 'path';
import Dotenv from "dotenv-webpack";

const gameType = process.env.GAME === "spatial" ? "spatial" : "classic";
const filename = gameType === "spatial" ? "spatialPong.ts" : "classicPong.ts";
const __dirname = path.dirname(__filename);
const __game_dirname = process.env.BUILD === "dev" ? 
	path.resolve(__dirname, `../../frontend/sources/public/${gameType}`)
	: path.resolve(__dirname, "../../client/" + gameType);

export default {
	mode: 'production',
	entry: './src/'+filename,
	output: {
		path: __game_dirname,
		filename: "index.js"
	},
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
		new Dotenv(),
	]
};