/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

const webpack = require('webpack');
const path = require('path');
const { StatsWriterPlugin } = require('webpack-stats-plugin');

// format `*.[chunkhash].min.js`
// eslint-disable-next-line no-useless-escape
const CHUNK_REGEX = /^([A-Za-z0-9_\-]+)\..*/;

module.exports = function (grunt) {
    grunt.initConfig({
        // project variables
        project: {
            build: './build',
            public: '/public',
            cdnPath: 'http://l.yimg.com/os/flx/',
        },

        // clean build
        clean: ['build'],

        // ------------------------------------------------------------------------------
        // DEV TASKS --------------------------------------------------------------------
        // ------------------------------------------------------------------------------

        copy: {
            images: {
                files: [
                    {
                        expand: true,
                        cwd: 'assets/',
                        src: ['images/**'],
                        dest: '<%= project.build %>/',
                    },
                ],
            },
        },

        // atomizer: initial task to generate the config
        atomizer: {
            app: {
                options: {
                    namespace: '#atomic',
                    configFile: './configs/atomic.js',
                },
                files: [
                    {
                        src: ['./components/*.js'],
                        dest: '<%= project.build %>/css/atomic.css',
                    },
                ],
            },
        },

        // cssmin for production (atomizer needs to run first)
        cssmin: {
            dev: {
                options: {
                    report: 'gzip',
                    compatibility: 'ie8',
                    sourceMap: true,
                },
                files: [
                    {
                        src: [
                            '<%= project.build %>/css/atomic.css',
                            './assets/css/base.css',
                            './assets/css/helpers.css',
                            './assets/css/custom.css',
                            './assets/css/mq.css',
                            './assets/css/syntax.css',
                        ],
                        dest: '<%= project.build %>/css/bundle.css',
                    },
                    {
                        src: ['./assets/css/ie.css'],
                        dest: '<%= project.build %>/css/ie.css',
                    },
                ],
            },
            prod: {
                options: {
                    report: 'gzip',
                    compatibility: 'ie8',
                    sourceMap: false,
                },
                files: [
                    {
                        src: [
                            '<%= project.build %>/css/atomic.css',
                            './assets/css/base.css',
                            './assets/css/helpers.css',
                            './assets/css/custom.css',
                            './assets/css/mq.css',
                            './assets/css/syntax.css',
                        ],
                        dest: '<%= project.build %>/css/bundle.css',
                    },
                    {
                        src: ['./assets/css/ie.css'],
                        dest: '<%= project.build %>/css/ie.css',
                    },
                ],
            },
        },

        // webpack bundling
        webpack: {
            dev: {
                mode: 'development',
                resolve: {
                    extensions: ['.js', '.jsx'],
                },
                entry: './client.js',
                output: {
                    path: __dirname + '/build/js',
                    publicPath: '/public/js/',
                    filename: '[name].js',
                    chunkFilename: '[name].[chunkhash].js',
                },
                module: {
                    rules: [
                        { test: /\.css$/, use: 'style!css' },
                        {
                            test: /\.js?$/,
                            exclude: /node_modules/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['@babel/preset-env'],
                                },
                            },
                        },
                        { test: /\.json$/, use: 'json-loader' },
                    ],
                },
                stats: {
                    colors: true,
                },
                devtool: 'source-map',
                keepalive: true,
            },
            prod: {
                mode: 'production',
                resolve: {
                    extensions: ['.js', '.jsx'],
                },
                entry: './client.js',
                output: {
                    path: __dirname + '/build/js',
                    publicPath: '<%= project.cdnPath %>js/',
                    filename: '[name].[chunkhash].min.js',
                    chunkFilename: '[name].[chunkhash].min.js',
                },
                module: {
                    rules: [
                        { test: /\.css$/, use: 'style!css' },
                        {
                            test: /\.js?$/,
                            exclude: /node_modules/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['@babel/preset-env'],
                                },
                            },
                        },
                        { test: /\.json$/, use: 'json-loader' },
                    ],
                },
                plugins: [
                    new StatsWriterPlugin({
                        filename: path.join('..', 'assets.json'),
                        transform: function (data, opts) {
                            var assets = data.assetsByChunkName;
                            var output = {
                                assets: {},
                            };

                            Object.keys(assets).forEach(
                                function eachAsset(key) {
                                    var value = assets[key];

                                    // if `*.[chunkhash].min.js` regex matched, then use file name for key
                                    var matches = key.match(CHUNK_REGEX);
                                    if (matches) {
                                        key = matches[1];
                                    }

                                    output.assets[key] = value;
                                },
                            );
                            return JSON.stringify(output, null, 4);
                        },
                    }),
                ],
                progress: false,
            },
        },
    });

    // libs
    grunt.loadNpmTasks('grunt-atomizer');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-webpack');

    // tasks
    grunt.registerTask('default', 'dev');
    grunt.registerTask('dev', [
        'clean',
        'copy',
        'atomizer:app',
        'cssmin:dev',
        'webpack:dev',
    ]);
    grunt.registerTask('build', [
        'clean',
        'copy',
        'atomizer:app',
        'cssmin:prod',
        'webpack:prod',
    ]);
};
