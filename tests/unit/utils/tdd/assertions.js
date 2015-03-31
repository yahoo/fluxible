/* global describe, it */
'use strict';

var ROOT = '../../../../';
var utils = require(ROOT + 'utils/tdd');
var createStore = require(ROOT + 'utils/createStore');

describe('assertions', function () {
    var DummyStore = createStore({
        storeName: 'DummyStore',
        handlers: {
            LOAD: '_load'
        },

        _load: function(hasChange) {
            hasChange && this.emitChange();
        }
    });

    describe('#assertStoreChange', function () {
        it('emmits a change event', function () {
            var store = new DummyStore();
            utils.assertStoreChange(store, 'LOAD', true);
            utils.assertStoreChange(store, '_load', true);
        });
    });

    describe('#assertStoreNotChange', function () {
        it('does not emmits a change event', function () {
            var store = new DummyStore();
            utils.assertStoreNotChange(store, 'LOAD', false);
            utils.assertStoreNotChange(store, '_load', false);
        });
    });

    describe('#assertDispatch', function () {
        function loadMore(context, params, done) {
            context.dispatch('LOAD_MORE', params);
            done();
        }

        it('dispatches a simple action', function () {
            utils.assertDispatch(loadMore, {
                params: {list: []}
            }, 'LOAD_MORE', {list: []});
        });
    });
});
