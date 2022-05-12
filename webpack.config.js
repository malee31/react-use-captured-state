import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
	mode: "production",
	entry: resolve(__dirname, "src", "index.js"),
	experiments: {
		outputModule: true,
	},
	optimization: {
		concatenateModules: true
	},
	output: {
		clean: true,
		iife: false,
		library: {
			type: "module"
		},
		module: true,
		path: resolve(__dirname, "build"),
		filename: "index.js",
		chunkFormat: "module",
		chunkLoading: "import"
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.ProvidePlugin({
			"React": "react"
		})
	],
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules|private/,
				use: {
					loader: "babel-loader"
				}
			}
		]
	},
	externals: {
		"react": "react",
		"react-dom": "react-dom"
	}
};