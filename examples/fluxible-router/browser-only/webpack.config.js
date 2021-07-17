const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './browser-only.js',
    output: {
        path: path.resolve('./build/js'),
        filename: 'browser-only.js',
        publicPath: '/public/js/',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        rootMode: 'upward',
                    },
                },
            },
        ],
    },
    plugins: [new HtmlWebpackPlugin()],
    devServer: {
        historyApiFallback: true,
        port: 3000,
    },
};
