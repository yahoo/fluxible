/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const str = require('underscore.string');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.pkg = require('../package.json');
    }

    async prompting() {
        this.log(
            yosay(
                'Welcome to the riveting ' +
                    chalk.red('Fluxible') +
                    ' generator!',
            ),
        );
        this.answers = await this.prompt([
            {
                type: 'input',
                name: 'name',
                default: this.appname,
                message: 'Project name:',
                validate: function (input) {
                    return !!input;
                },
            },
        ]);

        this.displayName = this.answers.name;
        this.name = str.slugify(this.answers.name);
        this.buildSystem = str.slugify(this.answers.buildSystem);
    }

    writing() {
        this.fs.copyTpl(
            this.templatePath(),
            this.destinationRoot(),
            this,
            null,
            { globOptions: { dot: true } },
        );
    }
};
