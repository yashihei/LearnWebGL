const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/script.ts',
	devtool: 'inline-source-map',

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'script.js'
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
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
		extensions: ['.ts', '.js']
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.pug'
		})
	]
};
