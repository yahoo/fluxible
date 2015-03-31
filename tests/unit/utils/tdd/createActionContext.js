/* global describe, it */
'use strict';

var ROOT = '../../../../';
var utils = require(ROOT + 'utils/tdd');
var createStore = require(ROOT + 'utils/createStore');
var assert = require('assert');

describe('#createActionContext', function () {
    var DummyStore1 = createStore({storeName: 'DummyStore1'});
    var DummyStore2 = createStore({storeName: 'DummyStore2'});

    it('creates a context', function () {
        var context = utils.createActionContext();

        assert.equal(typeof(context), 'object');
        assert.equal(typeof(context.dispatcher), 'object');
        assert.equal(typeof(context.Dispatcher), 'function');
    });

    it('creates a contexts with a registred store', function () {
        var context = utils.createActionContext({store: DummyStore1});

        assert.equal(typeof(context), 'object');
        assert(context.getStore(DummyStore1) instanceof DummyStore1);
    });

    it('creates a contexts with many registred stores', function () {
        var context = utils.createActionContext({stores: [DummyStore1, DummyStore2]});

        assert.equal(typeof(context), 'object');
        assert(context.getStore(DummyStore1) instanceof DummyStore1);
        assert(context.getStore(DummyStore2) instanceof DummyStore2);
    });
});
