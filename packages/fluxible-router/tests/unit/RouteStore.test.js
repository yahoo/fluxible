/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const { RouteStore } = require('../../');

var StaticRouteStore = RouteStore.withStaticRoutes({
    foo: {
        path: '/foo',
        method: 'get',
    },
    bar: {
        path: '/bar',
        method: 'get',
    },
});

describe('RouteStore', function () {
    describe('withStaticRoutes', function () {
        var routeStore;
        beforeEach(function () {
            routeStore = new StaticRouteStore();
            routeStore._handleNavigateStart({
                transactionId: 'first',
                url: '/foo',
                method: 'get',
            });
        });
        describe('dehydrate', function () {
            it('should dehydrate correctly', function () {
                var state = routeStore.dehydrate();
                expect(state).toBeInstanceOf(Object);
                expect(state.currentNavigate).toBeInstanceOf(Object);
                expect(state.currentNavigate.transactionId).toBe('first');
                expect(state.currentNavigate.url).toBe('/foo');
                expect(state.currentNavigate.method).toBe('get');
                expect(state.currentNavigate.route).toBeNull();
                expect(state.routes).toBeNull();
            });
        });
        describe('rehydrate', function () {
            it('should rehydrate correctly', function () {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentUrl: '/foo',
                    currentNavigate: {
                        transactionId: 'first',
                        url: '/foo',
                        method: 'get',
                    },
                    routes: null,
                });
                expect(newStore.getCurrentRoute()).toBeInstanceOf(Object);
                expect(newStore.getCurrentNavigate().transactionId).toBe(
                    'first',
                );
                expect(newStore.getCurrentNavigate().url).toBe('/foo');
                expect(newStore.getCurrentNavigate().method).toBe('get');
                expect(newStore._routes).toBeNull();
            });
        });

        it('should reuse static router between instances', function () {
            var newStore = new StaticRouteStore();
            expect(newStore._router).toBe(routeStore._router);
        });

        it('should only use the latest navigate on success', function () {
            // Start a new navigate before first has completed
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/bar',
                method: 'get',
            });
            expect(routeStore.isNavigateComplete()).toBe(false);
            routeStore._handleNavigateSuccess({
                transactionId: 'first',
                route: {
                    url: '/bar',
                    method: 'get',
                },
            });
            expect(routeStore.isNavigateComplete()).toBe(false);
            routeStore._handleNavigateSuccess({
                transactionId: 'second',
                route: {
                    url: '/bar',
                    method: 'get',
                },
            });
            expect(routeStore.isNavigateComplete()).toBe(true);
        });
        it('should only use the latest navigate on failure', function () {
            // Start a new navigate before first has completed
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/bar',
                method: 'get',
            });
            expect(routeStore.isNavigateComplete()).toBe(false);
            routeStore._handleNavigateFailure({
                transactionId: 'first',
                error: {
                    statusCode: 404,
                    message: 'Url /unknown does not match any routes',
                },
            });
            expect(routeStore.isNavigateComplete()).toBe(false);
            routeStore._handleNavigateFailure({
                transactionId: 'second',
                error: {
                    statusCode: 404,
                    message: 'Url /unknown does not match any routes',
                },
            });
            expect(routeStore.isNavigateComplete()).toBe(true);
        });
        it('should update transactionId', function () {
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/bar',
                method: 'get',
            });
            expect(routeStore.getCurrentNavigate().transactionId).toBe(
                'second',
            );
        });
        it('should update transactionId with same url navigation', function () {
            routeStore._handleNavigateStart({
                transactionId: 'second',
                url: '/foo',
                method: 'get',
            });
            expect(routeStore.getCurrentNavigate().transactionId).toBe(
                'second',
            );
        });
    });

    describe('dynamic routes', function () {
        var routeStore;
        var routes = {
            foo: {
                path: '/foo',
                method: 'get',
            },
            bar: {
                path: '/bar',
                method: 'post',
            },
        };
        beforeEach(function () {
            routeStore = new RouteStore();
            routeStore._handleReceiveRoutes(routes);
            routeStore._handleNavigateStart({
                url: '/foo',
                method: 'get',
            });
        });
        describe('dehydrate', function () {
            it('should dehydrate correctly', function () {
                var state = routeStore.dehydrate();
                expect(state).toBeInstanceOf(Object);
                expect(state.currentNavigate.url).toBe('/foo');
                expect(state.currentNavigate.method).toBe('get');
                expect(state.routes).toEqual(routes);
            });
        });
        describe('rehydrate', function () {
            it('should rehydrate correctly', function () {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentUrl: '/foo',
                    currentNavigate: { url: '/foo', method: 'get' },
                    routes: routes,
                });
                expect(newStore.getCurrentRoute()).toBeInstanceOf(Object);
                expect(newStore.getCurrentNavigate().url).toBe('/foo');
                expect(newStore.getCurrentNavigate().method).toBe('get');
                expect(newStore._routes).toEqual(routes);
            });

            it('should rehydrate POST routes correctly', function () {
                var newStore = new StaticRouteStore();
                newStore.rehydrate({
                    currentNavigate: { url: '/bar', method: 'post' },
                    routes: routes,
                });
                expect(newStore.getCurrentRoute()).toBeInstanceOf(Object);
                expect(newStore.getCurrentNavigate().url).toBe('/bar');
                expect(newStore.getCurrentNavigate().method).toBe('post');
                expect(newStore._routes).toEqual(routes);
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
                    query: {},
                };

                route = routeStore.getRoute('/foo');
                expect(route).toEqual(expected);

                route = routeStore.getRoute('/foo?test=1', { method: 'GET' });
                expected.query.test = '1';
                expected.url = '/foo?test=1';
                expect(route).toEqual(expected);

                route = routeStore.getRoute('/foo', { method: 'POST' });
                expect(route).toBeNull();
            });
            it('should handle POST routes', function () {
                var route;
                var expected = {
                    path: '/bar',
                    method: 'post',
                    name: 'bar',
                    url: '/bar',
                    params: {},
                    query: {},
                };

                route = routeStore.getRoute('/bar');
                expect(route).toBeNull();

                route = routeStore.getRoute('/bar', { method: 'GET' });
                expect(route).toBeNull();

                route = routeStore.getRoute('/bar', { method: 'POST' });
                expect(route).toEqual(expected);

                route = routeStore.getRoute('/bar?test=1', { method: 'POST' });
                expected.query.test = '1';
                expected.url = '/bar?test=1';
                expect(route).toEqual(expected);
            });
        });
    });

    it('Prev Navigate', function () {
        var routeStore = new RouteStore();
        var routes = {
            foo: {
                path: '/foo',
                method: 'get',
            },
            bar: {
                path: '/bar',
                method: 'post',
            },
        };
        routeStore._handleReceiveRoutes(routes);
        routeStore._handleNavigateStart({
            url: '/foo',
            method: 'get',
        });
        expect(routeStore.getCurrentNavigate().url).toBe('/foo');
        expect(routeStore.getCurrentNavigate().method).toBe('get');
        expect(routeStore.getPrevNavigate()).toBeNull();
        routeStore._handleNavigateSuccess({
            transactionId: 'first',
            route: {
                url: '/foo',
                method: 'get',
            },
        });
        routeStore._handleNavigateStart({
            url: '/bar',
            method: 'get',
        });
        expect(routeStore.getCurrentNavigate().url).toBe('/bar');
        expect(routeStore.getCurrentNavigate().method).toBe('get');
        expect(routeStore.getPrevNavigate().url).toBe('/foo');
        expect(routeStore.getPrevNavigate().method).toBe('get');

        var state = routeStore.dehydrate();
        expect(state).toBeInstanceOf(Object);
        expect(state.currentNavigate.url).toBe('/bar');
        expect(state.currentNavigate.method).toBe('get');
        expect(state.prevNavigate).toBeUndefined();
        expect(state.routes).toEqual(routes);
    });

    it('reset routes', function () {
        var routeStore = new RouteStore();
        var routes = {
            foo: {
                path: '/foo',
                method: 'get',
            },
            bar: {
                path: '/bar',
                method: 'post',
            },
        };
        routeStore._handleReceiveRoutes(routes);
        var state = routeStore.dehydrate();
        expect(state).toBeInstanceOf(Object);
        expect(state.routes).toEqual(routes);

        var newRoutes = {
            baz: {
                path: '/baz',
                method: 'get',
            },
        };
        routeStore._handleResetRoutes(newRoutes);
        var newState = routeStore.dehydrate();
        expect(newState).toBeInstanceOf(Object);
        expect(newState.routes).toEqual(newRoutes);
    });
});
