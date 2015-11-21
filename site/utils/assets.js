/**
 * In production, we use the webpack stats plugin to collect the asset hash names
 * and replace the local paths with the production ones.
 */

import path from 'path';

let assets = {
    common: '/public/js/common.js',
    main: '/public/js/main.js'
};

if ('production' === process.env.NODE_ENV) {
    try {
        var webpackAssets = require(path.join(__dirname, '..', 'build', 'assets.json'));
    } catch (e) {
        throw new Error('Please run `grunt build` to generate the production assets.');
    }
    assets.common = webpackAssets.cdnPath + webpackAssets.assets.common;
    assets.main = webpackAssets.cdnPath + webpackAssets.assets.main;
}

export default assets;
