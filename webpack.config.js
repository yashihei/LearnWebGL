module.exports = {
	mode: "development",
	entry: "./src/script.ts",
	devtool: "inline-source-map",

	output: {
		path: `${__dirname}/dist`,
		filename: "script.js"
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader"
			}
		]
	},
	resolve: {
		extensions: [".ts"]
	}
};