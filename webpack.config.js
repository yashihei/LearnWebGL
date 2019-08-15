const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: './src/script.ts',
	devtool: 'inline-source-map',

	output: {
		path: `${__dirname}/dist`,
		filename: 'script.js'
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader'
			},
			{
				test: /\.pug$/,
				use: [
					{
						loader: 'pug-loader',
						options: { pretty: true }
					}
				]
			}
		]
	},
	resolve: {
		extensions: ['.ts']
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.pug'
		})
	]
};
