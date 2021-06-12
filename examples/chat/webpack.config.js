const path = require('path');

module.exports = {
    mode: 'development',
    entry: './client.js',
    output: {
        path: path.resolve('./build/js'),
        filename: 'client.js',
        publicPath: '/public/js/',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader' },
            },
        ],
    },
    devServer: {
        historyApiFallback: true,
        port: 3000,
        proxy: {
            '*': { target: 'http://localhost:3001' },
        },
    },
};
