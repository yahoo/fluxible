/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
'use strict';

var expect = require('chai').expect;
var fetchrPlugin = require('../../../lib/fetchr-plugin');
var FluxibleApp = require('fluxible');
var mockService = require('../../fixtures/services/test');

describe('fetchrPlugin', function () {
    var app,
        pluginInstance,
        context,
        mockReq,
        xhrContext;

    beforeEach(function () {
        mockReq = {};
        app = new FluxibleApp();
        pluginInstance = fetchrPlugin({
            xhrPath: 'custom/api'
        });
        pluginInstance.registerService(mockService);
        app.plug(pluginInstance);
        xhrContext = {
            device: 'tablet'
        };
        context = app.createContext({
            req: mockReq,
            xhrContext: xhrContext
        });
    });

    describe('factory', function () {
        it('should use default xhr path', function () {
            var p = fetchrPlugin();
            expect(p.getXhrPath()).to.equal('/api');
        });
    });

    describe('actionContext', function () {
        var actionContext;
        beforeEach(function () {
            actionContext = context.getActionContext();
        });
        describe('service', function () {
            it('should have a service interface', function () {
                expect(actionContext.service).to.be.an('object');
                expect(actionContext.service.create).to.be.an('function');
                expect(actionContext.service.read).to.be.an('function');
                expect(actionContext.service.update).to.be.an('function');
                expect(actionContext.service['delete']).to.be.an('function');
            });
            describe('create', function () {
                it('should call the service\'s create method', function (done) {
                    actionContext.service.read('test', {}, {}, function (err, result) {
                        expect(result).to.equal('read');
                        expect(actionContext.getServiceMeta()).to.deep.equal([
                            {
                                headers: {
                                    'Cache-Control': 'private'
                                }
                            }
                        ]);
                        done();
                    });
                });
            });
            describe('read', function () {
                it('should call the service\'s read method', function (done) {
                    actionContext.service.create('test', {}, {}, function (err, result) {
                        expect(result).to.equal('create');
                        expect(actionContext.getServiceMeta()).to.be.empty;
                        done();
                    });
                });
            });
            describe('update', function () {
                it('should call the service\'s update method', function (done) {
                    actionContext.service.update('test', {}, {}, function (err, result) {
                        expect(result).to.equal('update');
                        expect(actionContext.getServiceMeta()).to.be.empty;
                        done();
                    });
                });
            });
            describe('delete', function () {
                it('should call the service\'s delete method', function (done) {
                    actionContext.service['delete']('test', {}, function (err, result) {
                        expect(result).to.equal('delete');
                        expect(actionContext.getServiceMeta()).to.be.empty;
                        done();
                    });
                });
            });
        });
    });

    describe('getMiddleware', function () {
        it('should return the fetchr middleware', function () {
            expect(pluginInstance.getMiddleware()).to.be.an('function');
        });
    });

    describe('context level', function () {
        var actionContext;
        beforeEach(function () {
            actionContext = context.getActionContext();
        });
        it('should dehydrate / rehydrate context correctly', function () {
            var contextPlug = pluginInstance.plugContext({ xhrContext: { device: 'tablet' }});
            contextPlug.rehydrate({
                xhrContext: {
                    device: 'tablet'
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 4000,
                corsPath: null
            });
            contextPlug.plugActionContext(actionContext);

            expect(contextPlug.dehydrate()).to.deep.equal({
                xhrContext: {
                    device: 'tablet'
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 4000,
                corsPath: null
            });
        });
        
        it('should dehydrate / rehydrate context correctly when updating new options', function () {
            var contextPlug = pluginInstance.plugContext({ xhrContext: { device: 'tablet' }});
            contextPlug.rehydrate({
                xhrContext: {
                    device: 'tablet'
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 4000,
                corsPath: null
            });
            contextPlug.plugActionContext(actionContext);
            actionContext.service.updateOptions({xhrTimeout: 1000});

            expect(contextPlug.dehydrate()).to.deep.equal({
                xhrContext: {
                    device: 'tablet'
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 1000,
                corsPath: null
            });
        });

        describe('with CORS', function () {
            it('should construct get CORS uri', function () {
                var contextPlug = pluginInstance.plugContext({xhrContext: { device: 'tablet', ver: '0.1.5' }});
                contextPlug.rehydrate({
                    xhrContext: {
                        device: 'tablet'
                    },
                    xhrPath: 'custom2/api',
                    corsPath: 'http://example.com'
                });
                contextPlug.plugActionContext(actionContext);

                expect(actionContext.service.constructGetXhrUri(
                    'resourceFoo',
                    {a: 1},
                    {cors: true}
                )).to.equal('http://example.com/resourceFoo;a=1?device=tablet', 'default construct uri function');
            });
        });

        describe('without CORS', function () {
            it('construct get xhr uri', function () {
                var contextPlug = pluginInstance.plugContext({xhrContext: { device: 'tablet', ver: '0.1.5' }});
                contextPlug.rehydrate({
                    xhrContext: {
                        device: 'tablet'
                    },
                    xhrPath: 'custom2/api'
                });
                contextPlug.plugActionContext(actionContext);

                expect(actionContext.service.constructGetXhrUri(
                    'resourceFoo',
                    {a: 1}
                )).to.equal('custom2/api/resourceFoo;a=1?device=tablet', 'default construct uri function');

                expect(actionContext.service.constructGetXhrUri(
                    'resourceFoo',
                    {a: 1},
                    {
                        constructGetUri: function () {
                            return '/customGetUri';
                        }
                    }
                )).to.equal('/customGetUri', 'custom custructGetUri function');
            });
        });
    });

    describe('plugContext', function () {
        it('should allow dynamic xhrPath', function () {
            mockReq = {
                site: 'foo'
            };
            app = new FluxibleApp();
            pluginInstance = fetchrPlugin({
                getXhrPath: function (contextOptions) {
                    return contextOptions.req.site + '/api';
                },
                xhrPath: 'custom/api'
            });
            var contextPlug = pluginInstance.plugContext({
                req: mockReq,
                xhrContext: { device: 'tablet' }
            });

            expect(contextPlug.dehydrate().xhrPath).to.equal('foo/api');
        });
    });

});
