module.exports = {
    entry: './src/entry',
    output: {
        path: 'dist',
        filename: 'bundle.js'
    },
    module: {
//        noParse: [/aws-sdk/],
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    },
    devtool: 'source-map'
};
