/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const TMP_DIR = process.env.TMP_DIR || __dirname;
const tempDir = path.join(TMP_DIR, 'temp');

describe('generator-fluxible', function () {
    beforeAll(function (done) {
        helpers.testDirectory(tempDir, (err) => {
            if (err) {
                return done(err);
            }

            this.lib = helpers.createGenerator(
                'fluxible',
                [[require('../../app'), 'fluxible']],
                'fluxy',
                { 'skip-install': true },
            );
            done();
        });
    });

    it('creates files', function () {
        return helpers
            .run(path.join(__dirname, '../../app'))
            .withOptions(test.options)
            .withArguments(['fluxy'])
            .withPrompts(Object.assign({}, test.prompts, { name: true }))
            .then(function () {
                assert.file([
                    'package.json',
                    'babel.config.js',
                    'app.js',
                    'components/Application.js',
                ]);
            });
    });
});
