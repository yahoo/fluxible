/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach,after */
'use strict';

var fetchr = require('fetchr');
var FluxibleApp = require('fluxible');
var fetchrPlugin = require('../../../lib/fetchr-plugin');
var mockService = require('../../fixtures/services/mockService');

describe('fetchrPlugin', function () {
    let app;
    let pluginInstance;
    let context;
    let mockReq;
    let xhrContext;
    let collectorStub = jest.fn();

    beforeEach(function () {
        mockReq = {};
        app = new FluxibleApp();
        pluginInstance = fetchrPlugin({
            xhrPath: 'custom/api',
            statsCollector: collectorStub,
        });
        pluginInstance.registerService(mockService);
        app.plug(pluginInstance);
        xhrContext = {
            device: 'tablet',
        };
        context = app.createContext({
            req: mockReq,
            xhrContext: xhrContext,
        });
        collectorStub.mockReset();
    });

    describe('factory', function () {
        it('should use default xhr path', function () {
            var p = fetchrPlugin();
            expect(p.getXhrPath()).toEqual('/api');
        });
    });

    describe('actionContext', function () {
        var actionContext;

        beforeEach(function () {
            actionContext = context.getActionContext();
        });

        describe('service', function () {
            it('should have a service interface', function () {
                expect(actionContext.service).toBeInstanceOf(Object);
                expect(actionContext.service.create).toBeInstanceOf(Function);
                expect(actionContext.service.read).toBeInstanceOf(Function);
                expect(actionContext.service.update).toBeInstanceOf(Function);
                expect(actionContext.service.delete).toBeInstanceOf(Function);
            });

            describe('read', function () {
                it("should call the service's read method", function (done) {
                    actionContext.service.read(
                        'test',
                        {},
                        {},
                        function (err, result) {
                            expect(result).toBe('read');
                            expect(actionContext.getServiceMeta()).toEqual([
                                {
                                    headers: {
                                        'Cache-Control': 'private',
                                    },
                                },
                            ]);
                            done();
                        },
                    );
                });
            });

            describe('create', function () {
                it("should call the service's create method", function (done) {
                    actionContext.service.create(
                        'test',
                        {},
                        {},
                        function (err, result) {
                            expect(result).toBe('create');
                            expect(actionContext.getServiceMeta()).toHaveLength(
                                0,
                            );
                            done();
                        },
                    );
                });
            });

            describe('update', function () {
                it("should call the service's update method", function (done) {
                    actionContext.service.update(
                        'test',
                        {},
                        {},
                        function (err, result) {
                            expect(result).toBe('update');
                            expect(actionContext.getServiceMeta()).toHaveLength(
                                0,
                            );
                            done();
                        },
                    );
                });
            });

            describe('delete', function () {
                it("should call the service's delete method", function (done) {
                    actionContext.service.delete(
                        'test',
                        {},
                        function (err, result) {
                            expect(result).toBe('delete');
                            expect(actionContext.getServiceMeta()).toHaveLength(
                                0,
                            );
                            done();
                        },
                    );
                });
            });
        });
    });

    describe('getMiddleware', function () {
        it('should return the fetchr middleware', function () {
            expect(pluginInstance.getMiddleware()).toBeInstanceOf(Function);
        });
    });

    describe('context level', function () {
        var actionContext;

        beforeEach(function () {
            actionContext = context.getActionContext();
        });

        it('should dehydrate / rehydrate context correctly', function () {
            var contextPlug = pluginInstance.plugContext({
                xhrContext: { device: 'tablet' },
            });
            contextPlug.rehydrate({
                xhrContext: {
                    device: 'tablet',
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 4000,
                corsPath: null,
            });
            contextPlug.plugActionContext(actionContext);

            expect(contextPlug.dehydrate()).toEqual({
                xhrContext: {
                    device: 'tablet',
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 4000,
                corsPath: null,
            });
        });

        it('should dehydrate / rehydrate context correctly when updating new options', function () {
            var contextPlug = pluginInstance.plugContext({
                xhrContext: { device: 'tablet' },
            });
            contextPlug.rehydrate({
                xhrContext: {
                    device: 'tablet',
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 4000,
                corsPath: null,
            });
            contextPlug.plugActionContext(actionContext);
            actionContext.service.updateOptions({ xhrTimeout: 1000 });

            expect(contextPlug.dehydrate()).toEqual({
                xhrContext: {
                    device: 'tablet',
                },
                xhrPath: 'custom2/api',
                xhrTimeout: 1000,
                corsPath: null,
            });
        });

        describe('with CORS', function () {
            it('should construct get CORS uri', function () {
                var contextPlug = pluginInstance.plugContext({
                    xhrContext: { device: 'tablet', ver: '0.1.5' },
                });
                contextPlug.rehydrate({
                    xhrContext: {
                        device: 'tablet',
                    },
                    xhrPath: 'custom2/api',
                    corsPath: 'http://example.com',
                });
                contextPlug.plugActionContext(actionContext);

                expect(
                    actionContext.service.constructGetXhrUri(
                        'resourceFoo',
                        { a: 1 },
                        { cors: true },
                    ),
                ).toBe('http://example.com/resourceFoo;a=1?device=tablet');
            });
        });

        describe('without CORS', function () {
            it('construct get xhr uri', function () {
                var contextPlug = pluginInstance.plugContext({
                    xhrContext: { device: 'tablet', ver: '0.1.5' },
                });
                contextPlug.rehydrate({
                    xhrContext: {
                        device: 'tablet',
                    },
                    xhrPath: 'custom2/api',
                });
                contextPlug.plugActionContext(actionContext);

                expect(
                    actionContext.service.constructGetXhrUri('resourceFoo', {
                        a: 1,
                    }),
                ).toBe('custom2/api/resourceFoo;a=1?device=tablet');

                expect(
                    actionContext.service.constructGetXhrUri(
                        'resourceFoo',
                        { a: 1 },
                        {
                            constructGetUri: function () {
                                return '/customGetUri';
                            },
                        },
                    ),
                ).toBe('/customGetUri');
            });
        });
    });

    describe('plugContext', function () {
        it('should allow xhrPath as option', function () {
            mockReq = {
                site: 'foo',
            };
            app = new FluxibleApp();
            pluginInstance = fetchrPlugin({
                xhrPath: 'custom2/api',
            });
            var contextPlug = pluginInstance.plugContext({
                req: mockReq,
                xhrContext: { device: 'tablet' },
            });

            expect(contextPlug.dehydrate().xhrPath).toBe('custom2/api');
        });

        it('should allow dynamic xhrPath', function () {
            mockReq = {
                site: 'foo',
            };
            app = new FluxibleApp();
            pluginInstance = fetchrPlugin({
                getXhrPath: function (contextOptions) {
                    return contextOptions.req.site + '/api';
                },
                xhrPath: 'custom/api',
            });
            var contextPlug = pluginInstance.plugContext({
                req: mockReq,
                xhrContext: { device: 'tablet' },
            });

            expect(contextPlug.dehydrate().xhrPath).toBe('foo/api');
        });
    });

    describe('statsCollector', function () {
        it('should use statsCollector', function (done) {
            const actionContext = context.getActionContext();

            actionContext.service.read('test', {}, {}, function (err, result) {
                expect(collectorStub).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });
});
