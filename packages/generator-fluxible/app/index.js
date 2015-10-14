/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var str = require('underscore.string');

module.exports = yeoman.generators.Base.extend({
    initializing: function () {
        this.pkg = require('../package.json');
    },

    prompting: function () {
        var done = this.async();

        this.log(yosay(
            'Welcome to the riveting ' + chalk.red('Fluxible') + ' generator!'
        ));

        var prompts = [{
            type: 'input',
            name: 'name',
            default: this.appname,
            message: 'Project name:',
            validate: function(input) {
                return !!input;
            }
        }];

        this.prompt(prompts, function (props) {
            this.displayName = props.name;
            this.name = str.slugify(props.name);
            this.buildSystem = str.slugify(props.buildSystem);
            done();
        }.bind(this));
    },

    writing: {
        config: function () {
            this.template('.babelrc', '.babelrc', this.context);
            this.template('.editorconfig', '.editorconfig', this.context);
            // .gitignore is renamed by npm to .npmignore, so use underscore
            this.template('_gitignore', '.gitignore', this.context);
            this.template('.eslintrc', '.eslintrc', this.context);
            this.template('package.json', 'package.json', this.context);
        },

        projectfiles: function () {
            this.template('app.js', 'app.js', this.context);
            this.template('client.js', 'client.js', this.context);
            this.template('server.js', 'server.js', this.context);
            this.template('start.js', 'start.js', this.context);
            this.template('webpack.config.js', 'webpack.config.js', this.context);
            this.template('webpack.config.production.js', 'webpack.config.production.js', this.context);
            this.template('webpack-dev-server.js', 'webpack-dev-server.js', this.context);
            this.directory('actions', 'actions', this.context);
            this.directory('components', 'components', this.context);
            this.directory('configs', 'configs', this.context);
            this.directory('stores', 'stores', this.context);
            // Webpack dev server needs this folder to exist before starting
            this.template('_buildgitignore', 'build/js/.gitignore', this.context);
        }
    },

    install: function () {
        this.installDependencies({
            npm: true,
            bower: false,
            skipInstall: this.options['skip-install']
        });
    }
});
