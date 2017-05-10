module.exports = {
	entry: './src/index.js',
	output: {
		filename: './dist/timeline.js',
		libraryTarget: 'umd',
		library: 'timeline'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
		],
	}
}