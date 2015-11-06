var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var shell = require('shelljs');

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    //quiet: true,
    proxy: {
        '*': { target: 'http://localhost:3001' }
    }
}).listen(3000, function () {
    shell.env.PORT = shell.env.PORT || 3001;
    shell.exec('"./node_modules/.bin/nodemon" start.js -e js,jsx', function () {});
    console.log('Webpack Dev Server listening on port 3000');
});
