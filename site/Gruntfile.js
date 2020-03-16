/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

// format `*.[chunkhash].min.js`
// eslint-disable-next-line no-useless-escape
var CHUNK_REGEX = /^([A-Za-z0-9_\-]+)\..*/;

var nodemonArgs = [];
if (process.env.DEBUGGER) {
    nodemonArgs.push('--debug');
}

module.exports = function (grunt) {
    grunt.initConfig({
        // project variables
        project: {
            build: './build',
            public: '/public',
            cdnPath: 'http://l.yimg.com/os/flx/'
        },

        // clean build
        clean: ['build'],

        // ------------------------------------------------------------------------------
        // DEV TASKS --------------------------------------------------------------------
        // ------------------------------------------------------------------------------

        jshint: {
            all: [
                '*.js',
                '{actions,components,services,stores}/**/*.js'
            ],
            options: {
                jshintrc: true
            }
        },

        copy: {
            images: {
                files: [{
                    expand: true,
                    cwd: 'assets/',
                    src: ['images/**'],
                    dest: '<%= project.build %>/'
                }]
            }
        },

        // run nodemon and watch concurrently
        concurrent: {
            dev: ['nodemon:app', 'watch', 'webpack:dev'],
            options: {
                logConcurrentOutput: true
            }
        },

        // watch for changes in static files (does not require a server restart) run tasks then reload
        // .rebooted is written by the nodemon task, it's written to force a browser reload
        watch: {
            atomizer: {
                files: ['configs/atomic.js', '.rebooted', './assets/css/*.css', './components/*.js'],
                tasks: ['atomizer', 'cssmin:dev'],
                options: {
                    interrupt: true,
                    livereload: false
                }
            }
        },

        // atomizer: initial task to generate the config
        atomizer: {
            app: {
                options: {
                    namespace: '#atomic',
                    configFile: './configs/atomic.js'
                },
                files: [
                    {
                        src: ['./components/*.js'],
                        dest: '<%= project.build %>/css/atomic.css'
                    }
                ]
            }
        },

        // cssmin for production (atomizer needs to run first)
        cssmin: {
            dev: {
                options: {
                    report: 'gzip',
                    compatibility: 'ie8',
                    sourceMap: true
                },
                files: [{
                    src: [
                        '<%= project.build %>/css/atomic.css',
                        './assets/css/base.css',
                        './assets/css/helpers.css',
                        './assets/css/custom.css',
                        './assets/css/mq.css',
                        './assets/css/syntax.css'
                    ],
                    dest: '<%= project.build %>/css/bundle.css'
                }, {
                    src: [ './assets/css/ie.css'],
                    dest: '<%= project.build %>/css/ie.css'
                }]
            },
            prod: {
                options: {
                    report: 'gzip',
                    compatibility: 'ie8',
                    sourceMap: false
                },
                files: [{
                    src: [
                        '<%= project.build %>/css/atomic.css',
                        './assets/css/base.css',
                        './assets/css/helpers.css',
                        './assets/css/custom.css',
                        './assets/css/mq.css',
                        './assets/css/syntax.css'
                    ],
                    dest: '<%= project.build %>/css/bundle.css'
                }, {
                    src: [ './assets/css/ie.css'],
                    dest: '<%= project.build %>/css/ie.css'
                }]
            }
        },

        // functional testing
        protractorWebdriver: {
            options: {
                path: './node_modules/.bin/'
            },
            all: {}
        },
        protractor: {
            options: {
                configFile: './tests/spec/protractor.conf.js',
                args: {
                    baseUrl: 'http://127.0.0.1:3000/'
                }
            },
            all: {}
        },

        // restart server on changes
        nodemon: {
            app: {
                script: './start.js',
                options: {
                    ignore: ['<%= project.build %>/**'],
                    ext: 'js,jsx,md',
                    nodeArgs: nodemonArgs
                }
            }
        },

        // webpack bundling
        webpack: {
            dev: {
                resolve: {
                    extensions: ['', '.js', '.jsx']
                },
                entry: './client.js',
                output: {
                    path: '<%= project.build %>/js',
                    publicPath: '/public/js/',
                    filename: '[name].js',
                    chunkFilename: '[name].[chunkhash].js'
                },
                module: {
                    loaders: [
                        { test: /\.css$/, loader: 'style!css' },
                        { test: /\.js?$/, exclude: /node_modules/, loader: require.resolve('babel-loader') },
                        { test: /\.json$/, loader: 'json-loader'}
                    ]
                },
                plugins: [
                    new webpack.DefinePlugin({
                        'process.env': {
                            NODE_ENV: JSON.stringify('development')
                        }
                    }),
                    new webpack.optimize.CommonsChunkPlugin('common.js', undefined, 2)
                ],
                stats: {
                    colors: true
                },
                devtool: 'source-map',
                watch: true,
                keepalive: true
            },
            prod: {
                resolve: {
                    extensions: ['', '.js', '.jsx']
                },
                entry: './client.js',
                output: {
                    path: '<%= project.build %>/js',
                    publicPath: '<%= project.cdnPath %>js/',
                    filename: '[name].[chunkhash].min.js',
                    chunkFilename: '[name].[chunkhash].min.js'
                },
                module: {
                    loaders: [
                        { test: /\.css$/, loader: 'style!css' },
                        { test: /\.js?$/, exclude: /node_modules/, loader: require.resolve('babel-loader') },
                        { test: /\.json$/, loader: 'json-loader'}
                    ]
                },
                plugins: [
                    new webpack.DefinePlugin({
                        'process.env': {
                            NODE_ENV: JSON.stringify('production')
                        }
                    }),

                    // These are performance optimizations for your bundles
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.OccurenceOrderPlugin(),
                    new webpack.optimize.CommonsChunkPlugin('common.[hash].min.js', 2),

                    new webpack.optimize.UglifyJsPlugin({
                        compress: {
                            warnings: false
                        }
                    }),

                    // generates webpack assets config to use hashed assets in production mode
                    function webpackStatsPlugin() {
                        this.plugin('done', function(stats) {
                            var data = stats.toJson();
                            var assets = data.assetsByChunkName;
                            var output = {
                                assets: {},
                                cdnPath: this.options.output.publicPath
                            };

                            Object.keys(assets).forEach(function eachAsset(key) {
                                var value = assets[key];

                                // if `*.[chunkhash].min.js` regex matched, then use file name for key
                                var matches = key.match(CHUNK_REGEX);
                                if (matches) {
                                    key = matches[1];
                                }

                                output.assets[key] = value;
                            });

                            fs.writeFileSync(
                                path.join(process.cwd(), 'build', 'assets.json'),
                                JSON.stringify(output, null, 4)
                            );
                        });
                    }
                ],

                // removes verbosity from builds
                progress: false
            }
        }
    });

    // libs
    grunt.loadNpmTasks('grunt-atomizer');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-protractor-webdriver');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-webpack');

    // tasks
    grunt.registerTask('default', 'dev');
    grunt.registerTask('dev', ['clean', 'copy', 'atomizer:app', 'cssmin:dev', 'concurrent:dev']);
    grunt.registerTask('build', ['clean', 'copy', 'atomizer:app', 'cssmin:prod', 'webpack:prod']);
    grunt.registerTask('func', ['protractorWebdriver', 'protractor']);
};
