/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var expect = require('chai').expect;
var RouteStore = require('../../../').RouteStore;
var StaticRouteStore = RouteStore.withStaticRoutes({
    foo: {
        path: '/foo',
        method: 'get'
    },
    bar : {
        path: '/bar',
        method: 'get'
    }
});

describe('RouteStore', function () {

    describe('withStaticRoutes', function () {
        var routeStore;
        beforeEach(function () {
            routeStore = new StaticRouteStore();
            routeStore._handleNavigateStart({
                transactionId: 'first',
                url: '/foo',
                method: 'get'
            });
        });
        describe('dehydrate', function () {
            it('should dehydrate correctly', function () {
                var state = routeStore.dehydrate();
                expect(state).to.be.an('object');
                expect(state.currentNavigate).to.be.an('object');
                expect(state.currentNavigate.transactionId).to.equal('first');
                expect(state.currentNavigate.url).to.equal('/foo');
                expect(state.currentNavigate.method).to.equal('get');
                expect(state.routes).to.equal(null);
            });
        });
        describe('rehydrate', function () {
            it('should rehydrate correctly', function () {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentUrl: '/foo',
                    currentNavigate: { transactionId: 'first', url: '/foo', method: 'get' },
                    routes: null
                });
                expect(newStore.getCurrentRoute()).to.be.an('object');
                expect(newStore.getCurrentNavigate().transactionId).to.equal('first');
                expect(newStore.getCurrentNavigate().url).to.equal('/foo');
                expect(newStore.getCurrentNavigate().method).to.equal('get');
                expect(newStore._routes).to.equal(null);
            });
        });

        it('should reuse static router between instances', function () {
            var newStore = new StaticRouteStore();
            expect(newStore._router).to.equal(routeStore._router);
        });

        it('should only use the latest navigate on success', function () {
            // Start a new navigate before first has completed
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/bar',
                method: 'get'
            });
            expect(routeStore.isNavigateComplete()).to.equal(false);
            routeStore._handleNavigateSuccess({
                transactionId: 'first',
                route: {
                    url: '/bar',
                    method: 'get'
                }
            });
            expect(routeStore.isNavigateComplete()).to.equal(false);
            routeStore._handleNavigateSuccess({
                transactionId: 'second',
                route: {
                    url: '/bar',
                    method: 'get'
                }
            });
            expect(routeStore.isNavigateComplete()).to.equal(true);
        });
        it('should only use the latest navigate on failure', function () {
            // Start a new navigate before first has completed
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/bar',
                method: 'get'
            });
            expect(routeStore.isNavigateComplete()).to.equal(false);
            routeStore._handleNavigateFailure({
                transactionId: 'first',
                error: {
                    statusCode: 404,
                    message: 'Url /unknown does not match any routes'
                }
            });
            expect(routeStore.isNavigateComplete()).to.equal(false);
            routeStore._handleNavigateFailure({
                transactionId: 'second',
                error: {
                    statusCode: 404,
                    message: 'Url /unknown does not match any routes'
                }
            });
            expect(routeStore.isNavigateComplete()).to.equal(true);
        });
        it('should update transactionId', function () {
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/bar',
                method: 'get'
            });
            expect(routeStore.getCurrentNavigate().transactionId).to.equal('second');
        });
        it('should update transactionId with same url navigation', function () {
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/foo',
                method: 'get'
            });
            expect(routeStore.getCurrentNavigate().transactionId).to.equal('second');
        });
    });

    describe('dynamic routes', function () {
        var routeStore;
        var routes = {
            foo: {
                path: '/foo',
                method: 'get'
            },
            bar: {
                path: '/bar',
                method: 'post'
            }
        };
        beforeEach(function () {
            routeStore = new RouteStore();
            routeStore._handleReceiveRoutes(routes);
            routeStore._handleNavigateStart({
                url: '/foo',
                method: 'get'
            });
        });
        describe('dehydrate', function () {
            it('should dehydrate correctly', function () {
                var state = routeStore.dehydrate();
                expect(state).to.be.an('object');
                expect(state.currentNavigate.url).to.equal('/foo');
                expect(state.currentNavigate.method).to.equal('get');
                expect(state.routes).to.deep.equal(routes);
            });
        });
        describe('rehydrate', function () {
            it('should rehydrate correctly', function () {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentUrl: '/foo',
                    currentNavigate: { url: '/foo', method: 'get' },
                    routes: routes
                });
                expect(newStore.getCurrentRoute()).to.be.an('object');
                expect(newStore.getCurrentNavigate().url).to.equal('/foo');
                expect(newStore.getCurrentNavigate().method).to.equal('get');
                expect(newStore._routes).to.deep.equal(routes);
            });

            it('should rehydrate POST routes correctly', function() {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentNavigate: { url: '/bar', method: 'post' },
                    routes: routes
                });
                expect(newStore.getCurrentRoute()).to.be.an('object');
                expect(newStore.getCurrentNavigate().url).to.equal('/bar');
                expect(newStore.getCurrentNavigate().method).to.equal('post');
                expect(newStore._routes).to.deep.equal(routes);
            });
        });

        describe('getRoute', function () {
            it('should handle GET routes', function () {
                var route;
                var expected = {
                    path: '/foo',
                    method: 'get',
                    name: 'foo',
                    url: '/foo',
                    params: {},
                    query: {}
                };

                route = routeStore.getRoute('/foo');
                expect(route).to.deep.equal(expected);

                route = routeStore.getRoute('/foo?test=1', { method: 'GET' });
                expected.query.test = '1';
                expected.url = '/foo?test=1';
                expect(route).to.deep.equal(expected);

                route = routeStore.getRoute('/foo', { method: 'POST' });
                expect(route).to.equal(null);
            });
            it('should handle POST routes', function () {
                var route;
                var expected = {
                    path: '/bar',
                    method: 'post',
                    name: 'bar',
                    url: '/bar',
                    params: {},
                    query: {}
                };

                route = routeStore.getRoute('/bar');
                expect(route).to.equal(null);

                route = routeStore.getRoute('/bar', { method: 'GET' });
                expect(route).to.equal(null);

                route = routeStore.getRoute('/bar', { method: 'POST' });
                expect(route).to.deep.equal(expected);

                route = routeStore.getRoute('/bar?test=1', { method: 'POST' });
                expected.query.test = '1';
                expected.url = '/bar?test=1';
                expect(route).to.deep.equal(expected);
            });
        });
    });

});
