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
    entry: './client.js',
    output: {
        filename: isProduction ? 'main.min.js' : 'main.js',
        path: path.resolve('./dist/public'),
        publicPath: '/public/',
    },
};

const serverConfig = {
    ...commonConfig,
    target: 'node',
    entry: './server.js',
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist'),
    },
    externals: [nodeExternals()],
    externalsPresets: { node: true },
};

module.exports = [browserConfig, serverConfig];
