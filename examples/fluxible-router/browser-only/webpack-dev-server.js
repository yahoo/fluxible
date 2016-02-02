var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.browser.config');

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    contentBase: '/',
    quiet: false,
    host: '127.0.0.1',
    colors: true,
    port: 3001,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    stats: false,
    headers: {'Access-Control-Allow-Origin': '*'}
}).listen(3000, function () {
    console.log('Webpack Dev Server listening on port 3000!');
});
