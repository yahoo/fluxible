/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

// this file is mainly used to register babel
// since the file that registers babel cannot be es6-ified

// some environments run the app from a different directory
process.chdir(__dirname);

// config babel cache path
if (process.env.manhattan_context__cache_dir) {
    process.env.BABEL_CACHE_PATH = process.env.manhattan_context__cache_dir + '/.babel.json';
}

require('babel/register');

module.exports = require('./server');
