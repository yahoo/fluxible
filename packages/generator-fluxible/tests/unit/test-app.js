/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,before,it*/

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('generator-fluxible', function () {
    describe('app', function () {
        before(function (done) {
            helpers.run(path.join(__dirname, '../../app'))
                .inDir(path.join(os.tmpdir(), './temp-test'))
                .withOptions({ 'skip-install': true })
                .on('end', done);
        });

        it('creates files', function () {
            assert.file([
                'package.json',
                '.editorconfig',
                '.babelrc',
                '.eslintrc',
                'app.js',
                'components/Application.js'
            ]);
        });
    });
});
