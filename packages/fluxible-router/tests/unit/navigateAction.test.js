/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const createMockActionContext = require('fluxible/utils/createMockActionContext');
const { RouteStore, navigateAction } = require('../../');

describe('navigateAction', function () {
    var mockContext;
    var routes = {
        home: {
            method: 'get',
            path: '/',
        },
        withParams: {
            method: 'get',
            path: '/withParams/:id',
        },
        action: {
            method: 'get',
            path: '/action',
            action: function (context, payload, done) {
                done();
            },
        },
        fail: {
            method: 'get',
            path: '/fail',
            action: function (context, payload, done) {
                done(new Error('fail'));
            },
        },
        string: {
            method: 'get',
            path: '/string',
            action: 'foo',
        },
        post: {
            method: 'post',
            path: '/post',
            action: function (context, payload, done) {
                done();
            },
        },
        noMatchedAction: {
            method: 'get',
            path: '/noMatchedAction',
            action: 'noMatchedAction',
        },
    };
    var fooAction = function (context, payload, done) {
        done();
    };

    beforeEach(function () {
        mockContext = createMockActionContext({
            stores: [RouteStore],
        });
        mockContext.dispatcherContext.dispatch('RECEIVE_ROUTES', routes);
        mockContext.getAction = function (actionName, foo) {
            if ('foo' === actionName) {
                return fooAction;
            }
        };
    });

    it('should dispatch on route match', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/',
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[0].name).toBe(
                    'NAVIGATE_START',
                );
                expect(mockContext.dispatchCalls[0].payload.url).toBe('/');
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe('/');
                done();
            },
        );
    });

    it('should include query param on route match', function (done) {
        var url = '/?foo=bar&a=b&a=c&bool#abcd=fff';
        navigateAction(
            mockContext,
            {
                url: url,
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[0].name).toBe(
                    'NAVIGATE_START',
                );
                var route = mockContext
                    .getStore('RouteStore')
                    .getCurrentRoute();
                expect(route.query).toEqual({
                    foo: 'bar',
                    a: ['b', 'c'],
                    bool: '',
                });
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                var navigateSuccessPayload =
                    mockContext.dispatchCalls[1].payload;
                expect(navigateSuccessPayload.route.url).toBe(
                    url.split('#')[0],
                );
                done();
            },
        );
    });

    it('should include navigate object on route match', function (done) {
        var url = '/';
        var nav = {
            transactionId: 'foo',
            url: url,
            someKey1: 'someData',
            someKey2: {
                someKey3: ['a', 'b'],
            },
        };
        navigateAction(mockContext, nav, function (err) {
            expect(err).toBeUndefined();
            expect(mockContext.dispatchCalls.length).toBe(2);
            expect(mockContext.dispatchCalls[0].name).toBe('NAVIGATE_START');
            var navigate = mockContext
                .getStore('RouteStore')
                .getCurrentNavigate();
            expect(navigate).toBeInstanceOf(Object);
            Object.keys(nav).forEach(function (navKey) {
                expect(navigate[navKey]).toEqual(nav[navKey]);
            });
            done();
        });
    });

    it('should not call execute action if there is no action', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/',
            },
            function () {
                expect(mockContext.executeActionCalls.length).toBe(0);
                done();
            },
        );
    });

    it('should call execute action if there is an action', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/action',
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe(
                    '/action',
                );
                expect(mockContext.executeActionCalls.length).toBe(1);
                expect(mockContext.executeActionCalls[0].action).toBe(
                    routes.action.action,
                );
                expect(mockContext.executeActionCalls[0].payload.url).toBe(
                    '/action',
                );
                done();
            },
        );
    });

    it('should call execute action if there is an action as a string', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/string',
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe(
                    '/string',
                );
                expect(mockContext.executeActionCalls.length).toBe(1);
                expect(mockContext.executeActionCalls[0].action).toBe(
                    fooAction,
                );
                expect(mockContext.executeActionCalls[0].payload.url).toBe(
                    '/string',
                );
                done();
            },
        );
    });

    it('should dispatch failure if action failed', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/fail',
            },
            function (err) {
                expect(err).toBeInstanceOf(Error);
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_FAILURE',
                );
                expect(
                    mockContext.dispatchCalls[1].payload.error,
                ).toBeInstanceOf(Object);
                expect(mockContext.dispatchCalls[1].payload.error.message).toBe(
                    err.message,
                );
                expect(
                    mockContext.getStore(RouteStore).isNavigateComplete(),
                ).toBe(true);
                done();
            },
        );
    });

    it('should call back with a 404 error if route not found', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/404',
            },
            function (err) {
                expect(err).toBeInstanceOf(Error);
                expect(err.statusCode).toBe(404);
                done();
            },
        );
    });

    it('should call back with a 404 error if url matches but not method', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/post',
                method: 'get',
            },
            function (err) {
                expect(err).toBeInstanceOf(Error);
                expect(err.statusCode).toBe(404);
                done();
            },
        );
    });

    it('should dispatch if both url and method matches', function (done) {
        navigateAction(
            mockContext,
            {
                url: '/post',
                method: 'post',
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[0].name).toBe(
                    'NAVIGATE_START',
                );
                expect(mockContext.dispatchCalls[0].payload.url).toBe('/post');
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe('/post');
                done();
            },
        );
    });

    it("should dispatch faliure if action can't be resolved", function (done) {
        navigateAction(
            mockContext,
            {
                url: '/noMatchedAction',
                method: 'get',
            },
            function (err) {
                expect(err.statusCode).toBe(500);
                expect(err.message).toBe(
                    'Action for /noMatchedAction can not be resolved',
                );
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[0].name).toBe(
                    'NAVIGATE_START',
                );
                expect(mockContext.dispatchCalls[0].payload.url).toBe(
                    '/noMatchedAction',
                );
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_FAILURE',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe(
                    '/noMatchedAction',
                );
                done();
            },
        );
    });

    it('should dispatch if routeName is passed and it matches', function (done) {
        navigateAction(
            mockContext,
            {
                routeName: 'home',
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[0].name).toBe(
                    'NAVIGATE_START',
                );
                expect(mockContext.dispatchCalls[0].payload.url).toBe('/');
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe('/');
                done();
            },
        );
    });

    it('should dispatch if routeName is passed with params and it matches', function (done) {
        navigateAction(
            mockContext,
            {
                routeName: 'withParams',
                params: { id: 5 },
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[0].name).toBe(
                    'NAVIGATE_START',
                );
                expect(mockContext.dispatchCalls[0].payload.url).toBe(
                    '/withParams/5',
                );
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe(
                    '/withParams/5',
                );
                done();
            },
        );
    });

    it('should dispatch with query params', function (done) {
        navigateAction(
            mockContext,
            {
                routeName: 'withParams',
                params: { id: 5 },
                query: { foo: 'bar' },
            },
            function (err) {
                expect(err).toBeUndefined();
                expect(mockContext.dispatchCalls.length).toBe(2);
                expect(mockContext.dispatchCalls[0].name).toBe(
                    'NAVIGATE_START',
                );
                expect(mockContext.dispatchCalls[0].payload.url).toBe(
                    '/withParams/5?foo=bar',
                );
                expect(mockContext.dispatchCalls[1].name).toBe(
                    'NAVIGATE_SUCCESS',
                );
                expect(mockContext.dispatchCalls[1].payload.url).toBe(
                    '/withParams/5?foo=bar',
                );
                done();
            },
        );
    });

    it('should error if routeStore does not exist', function (done) {
        function BadRouteStore() {}
        BadRouteStore.storeName = 'RouteStore';

        var newMockContext = createMockActionContext({
            stores: [BadRouteStore],
        });
        newMockContext.dispatcherContext.dispatch('RECEIVE_ROUTES', routes);
        navigateAction(
            newMockContext,
            {
                url: '/action',
                method: 'get',
            },
            function (err) {
                expect(err).toBeInstanceOf(Error);
                expect(err.message).toBe(
                    'RouteStore has not implemented `getCurrentRoute` method.',
                );
                done();
            },
        );
    });
});
