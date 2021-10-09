const path = require('path');
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV !== 'development';

const commonConfig = {
    mode: isProduction ? 'production' : 'development',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader' },
            },
        ],
    },
};

const browserConfig = {
    ...commonConfig,
    target: 'web',
    entry: './src/browser.js',
    output: {
        filename: 'browser.js',
        path: path.resolve(__dirname, 'dist/assets'),
        publicPath: '/assets/',
    },
};

const serverConfig = {
    ...commonConfig,
    target: 'node',
    entry: './src/server.js',
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist'),
    },
    externals: [nodeExternals()],
    externalsPresets: { node: true },
};

module.exports = [browserConfig, serverConfig];
