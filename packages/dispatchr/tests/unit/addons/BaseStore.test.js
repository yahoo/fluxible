/*globals describe,it */
'use strict';

var BaseStore = require('../../../addons/BaseStore');

var contextMock = {
    dimensions: {},
};
var dispatcherMock = {
    getContext: function () {
        return contextMock;
    },
};

describe('BaseStore', function () {
    it('instantiates correctly', function () {
        var store = new BaseStore(dispatcherMock);
        expect(store.dispatcher).toBe(dispatcherMock);
        expect(store.getContext()).toBe(dispatcherMock.getContext());
    });

    it('allows listening for changes', function (done) {
        var store = new BaseStore(dispatcherMock);
        var payloadMock = {
            foo: 'bar',
        };
        store.addChangeListener(function (payload) {
            expect(payload.foo).toBe('bar');
            done();
        });
        store.emitChange(payloadMock);
    });
});
