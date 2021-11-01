/*globals describe,it*/
'use strict';

var createStore = require('../../../addons/createStore');

describe('createStore', function () {
    it('should return a valid Constructor', function () {
        var mock = {
                dispatcher: { dispatcher: true },
                param: { c: 3 },
                handlers: { TEST: 'test' },
            },
            ExampleStore = createStore({
                statics: {
                    storeName: 'ExampleStore',
                    handlers: mock.handlers,
                },
                initialize: function () {
                    expect(this.dispatcher).toEqual(mock.dispatcher);
                },
                test: function (param) {
                    expect(param).toBe(mock.param);
                },
            }),
            store = new ExampleStore(mock.dispatcher);

        store.test(mock.param);
        expect(ExampleStore.handlers).toEqual(mock.handlers);
        expect(store.dispatcher).toEqual(mock.dispatcher);
    });

    it('should handle mixins', function () {
        var mixin_initialize_called = false,
            base_initialize_called = false,
            mock = {
                dispatcher: { dispatcher: true },
                param: { c: 3 },
            },
            ExampleMixin = {
                initialize: function () {
                    mixin_initialize_called = true;
                },
                mixin_test: function (param) {
                    expect(param).toBe(mock.param);
                },
            },
            ExampleStore = createStore({
                statics: {
                    storeName: 'ExampleStore',
                    mixins: [ExampleMixin],
                },
                initialize: function () {
                    expect(mixin_initialize_called).toBe(true);
                    base_initialize_called = true;
                },
                test: function (param) {
                    expect(param).toBe(mock.param);
                },
            }),
            store = new ExampleStore(mock.dispatcher);

        store.test(mock.param);
        store.mixin_test(mock.param);
        expect(store.dispatcher).toEqual(mock.dispatcher);
        expect(mixin_initialize_called).toBe(true);
        expect(base_initialize_called).toBe(true);
    });

    it('should error on mixin conflict', function () {
        var mock = {
                dispatcher: { dispatcher: true },
            },
            ExampleMixin = {
                test: function () {},
            },
            ExampleStore;

        expect(function () {
            ExampleStore = createStore({
                statics: {
                    storeName: 'ExampleStore',
                    mixins: [ExampleMixin],
                },
                test: function () {},
            });
        }).toThrowError(Error);
    });
});
