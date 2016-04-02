/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,before,beforeEach */
var expect = require('chai').expect;
var navigateAction = require('../../../lib/navigateAction');
var createMockActionContext = require('fluxible/utils/createMockActionContext');
var RouteStore = require('../../../').RouteStore;

describe('navigateAction', function () {
    var mockContext;
    var routes = {
        home: {
            method: 'get',
            path: '/'
        },
        withParams: {
            method: 'get',
            path: '/withParams/:id'
        },
        action: {
            method: 'get',
            path: '/action',
            action: function (context, payload, done) {
                done();
            }
        },
        fail: {
            method: 'get',
            path: '/fail',
            action: function (context, payload, done) {
                done(new Error('fail'));
            }
        },
        string: {
            method: 'get',
            path: '/string',
            action: 'foo'
        },
        post: {
            method: 'post',
            path: '/post',
            action: function (context, payload, done) {
                done();
            }
        }
    };
    var fooAction = function (context, payload, done) {
        done();
    };

    beforeEach(function () {
        mockContext = createMockActionContext({
            stores: [RouteStore]
        });
        mockContext.dispatcherContext.dispatch('RECEIVE_ROUTES', routes);
        mockContext.getAction = function (actionName, foo) {
            if ('foo' === actionName) {
                return fooAction;
            }
        };
    });

    it('should dispatch on route match', function (done) {
        navigateAction(mockContext, {
            url: '/'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            expect(mockContext.dispatchCalls[0].payload.url).to.equal('/');
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/');
            done();
        });
    });

    it('should include query param on route match', function (done) {
        var url = '/?foo=bar&a=b&a=c&bool#abcd=fff';
        navigateAction(mockContext, {
            url: url
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            var route = mockContext.getStore('RouteStore').getCurrentRoute();
            expect(route.query).to.eql({foo: 'bar', a: ['b', 'c'], bool: null}, 'query added to route payload for NAVIGATE_START' + JSON.stringify(route));
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            var navigateSuccessPayload = mockContext.dispatchCalls[1].payload;
            expect(navigateSuccessPayload.route.url).to.equal(url.split('#')[0]);
            done();
        });
    });

    it('should include navigate object on route match', function (done) {
        var url = '/';
        var nav = {
            transactionId: 'foo',
            url: url,
            someKey1: 'someData',
            someKey2: {
                someKey3: ['a', 'b']
            }
        };
        navigateAction(mockContext, nav, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            var navigate = mockContext.getStore('RouteStore').getCurrentNavigate();
            expect(navigate).to.be.an('object');
            Object.keys(nav).forEach(function (navKey) {
                expect(navigate[navKey]).to.eql(nav[navKey]);
            });
            done();
        });
    });

    it('should not call execute action if there is no action', function (done) {
        navigateAction(mockContext, {
            url: '/'
        }, function () {
            expect(mockContext.executeActionCalls.length).to.equal(0);
            done();
        });
    });

    it('should call execute action if there is an action', function (done) {
        navigateAction(mockContext, {
            url: '/action'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/action');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0].action).to.equal(routes.action.action);
            expect(mockContext.executeActionCalls[0].payload.url).to.equal('/action');
            done();
        });
    });

    it('should call execute action if there is an action as a string', function (done) {
        navigateAction(mockContext, {
            url: '/string'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/string');
            expect(mockContext.executeActionCalls.length).to.equal(1);
            expect(mockContext.executeActionCalls[0].action).to.equal(fooAction);
            expect(mockContext.executeActionCalls[0].payload.url).to.equal('/string');
            done();
        });
    });

    it('should dispatch failure if action failed', function (done) {
        navigateAction(mockContext, {
            url: '/fail'
        }, function (err) {
            expect(err).to.be['instanceof'](Error);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_FAILURE');
            expect(mockContext.dispatchCalls[1].payload.error).to.be.an('object');
            expect(mockContext.dispatchCalls[1].payload.error.message).to.equal(err.message);
            expect(mockContext.getStore(RouteStore).isNavigateComplete()).to.equal(true);
            done();
        });
    });

    it('should call back with a 404 error if route not found', function (done) {
        navigateAction(mockContext, {
            url: '/404'
        }, function (err) {
            expect(err).to.be['instanceof'](Error);
            expect(err.statusCode).to.equal(404);
            done();
        });
    });

    it('should call back with a 404 error if url matches but not method', function (done) {
        navigateAction(mockContext, {
            url: '/post',
            method: 'get'
        }, function (err) {
            expect(err).to.be['instanceof'](Error);
            expect(err.statusCode).to.equal(404);
            done();
        });
    });

    it('should dispatch if both url and method matches', function (done) {
        navigateAction(mockContext, {
            url: '/post',
            method: 'post'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            expect(mockContext.dispatchCalls[0].payload.url).to.equal('/post');
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/post');
            done();
        });
    });

    it('should dispatch if routeName is passed and it matches', function (done) {
        navigateAction(mockContext, {
            routeName: 'home'
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            expect(mockContext.dispatchCalls[0].payload.url).to.equal('/');
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/');
            done();
        });
    });

    it('should dispatch if routeName is passed with params and it matches', function (done) {
        navigateAction(mockContext, {
            routeName: 'withParams',
            params: { id: 5 }
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            expect(mockContext.dispatchCalls[0].payload.url).to.equal('/withParams/5');
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/withParams/5');
            done();
        });
    });

    it('should dispatch with query params', function (done) {
        navigateAction(mockContext, {
            routeName: 'withParams',
            params: { id: 5 },
            query: { foo: 'bar' }
        }, function (err) {
            expect(err).to.equal(undefined);
            expect(mockContext.dispatchCalls.length).to.equal(2);
            expect(mockContext.dispatchCalls[0].name).to.equal('NAVIGATE_START');
            expect(mockContext.dispatchCalls[0].payload.url).to.equal('/withParams/5?foo=bar');
            expect(mockContext.dispatchCalls[1].name).to.equal('NAVIGATE_SUCCESS');
            expect(mockContext.dispatchCalls[1].payload.url).to.equal('/withParams/5?foo=bar');
            done();
        });
    });

    it('should error if routeStore does not exist', function (done) {
        function BadRouteStore(){}
        BadRouteStore.storeName = 'RouteStore';

        var newMockContext = createMockActionContext({
            stores: [BadRouteStore]
        });
        newMockContext.dispatcherContext.dispatch('RECEIVE_ROUTES', routes);
        navigateAction(newMockContext, {
            url: '/action',
            method: 'get'
        }, function (err) {
            expect(err).to.be['instanceof'](Error);
            expect(err.message).to.equal('RouteStore has not implemented `getCurrentRoute` method.');
            done();
        });
    });
});
