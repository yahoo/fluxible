/*globals describe,it,afterEach,beforeEach*/
"use strict";

var expect = require('chai').expect,
    React = require('react/addons'),
    ReactTestUtils = require('react/lib/ReactTestUtils'),
    StoreMixin = require('../../../mixins/StoreMixin'),
    createStore = require('dispatchr/utils/createStore'),
    MockStore = createStore({
        storeName: 'MockStore'
    }),
    MockStore2 = createStore({
        storeName: 'MockStore2'
    }),
    MockContext = require('../../../utils/MockComponentContext')(),
    jsdom = require('jsdom');

MockContext.Dispatcher.registerStore(MockStore);
MockContext.Dispatcher.registerStore(MockStore2);

describe('StoreListenerMixin', function () {
    var context,
        mockStore,
        mockStore2;

    beforeEach(function (done) {
        context = new MockContext();
        mockStore = context.getStore(MockStore);
        mockStore2 = context.getStore(MockStore2);
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;
            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
    });

    describe('componentDidMount', function () {
        it('should create an listeners array on start', function () {
            expect(StoreMixin.listeners).to.not.exist;
            StoreMixin.componentDidMount();
            expect(StoreMixin.listeners).to.exist;
            expect(StoreMixin.listeners).to.be.empty;
        });
        it('should register static listener array', function (done) {
            var Component = React.createClass({
                mixins: [StoreMixin],
                statics: {
                    storeListeners: [MockStore]
                },
                onChange: function () {
                    done();
                },
                render: function () { return null; }
            });
            var component = ReactTestUtils.renderIntoDocument(Component({context: context}));
            expect(component.listeners).to.have.length(1);
            mockStore.emitChange();
        });
        it('should register static listener object', function (done) {
            var Component = React.createClass({
                mixins: [StoreMixin],
                statics: {
                    storeListeners: {
                        'onChange2': MockStore
                    }
                },
                onChange2: function () {
                    done();
                },
                render: function () { return null; }
            });
            var component = ReactTestUtils.renderIntoDocument(Component({context: context}));
            expect(component.listeners).to.have.length(1);
            mockStore.emitChange();
        });
        it('should register static listener object with array', function (done) {
            var Component = React.createClass({
                mixins: [StoreMixin],
                statics: {
                    storeListeners: {
                        'onChange2': [MockStore]
                    }
                },
                onChange2: function () {
                    done();
                },
                render: function () { return null; }
            });
            var component = ReactTestUtils.renderIntoDocument(Component({context: context}));
            expect(component.listeners).to.have.length(1);
            mockStore.emitChange();
        });
    });

    describe('iterating over storeListeners', function() {
        it('should expose iterables for static listener array', function () {
            var Component = React.createClass({
                mixins: [StoreMixin],
                statics: {
                    storeListeners: [MockStore, MockStore2]
                },
                onChange: function () {
                },
                render: function () { return null; }
            });
            var component = ReactTestUtils.renderIntoDocument(Component({context: context}));
            expect(component.getStores(), 'getStores').to.have.length(2);
            expect(component.getListeners(), 'getListeners').to.have.length(2);
        });
        it('should expose iterables for static listener object', function () {
            var Component = React.createClass({
                mixins: [StoreMixin],
                statics: {
                    storeListeners: {
                        'onChange2': MockStore,
                        'onChange3': MockStore2
                    }
                },
                onChange2: function () {
                },
                onChange3: function () {
                },
                render: function () { return null; }
            });
            var component = ReactTestUtils.renderIntoDocument(Component({context: context}));
            expect(component.getStores(), 'getStores').to.have.length(2);
            expect(component.getListeners(), 'getListeners').to.have.length(2);
        });
        it('should expose iterables for static listener object with array', function () {
            var Component = React.createClass({
                mixins: [StoreMixin],
                statics: {
                    storeListeners: {
                        'onChange2': [MockStore, MockStore2]
                    }
                },
                onChange2: function () {
                },
                render: function () { return null; }
            });
            var component = ReactTestUtils.renderIntoDocument(Component({context: context}));
            expect(component.getStores(), 'getStores').to.have.length(2);
            expect(component.getListeners(), 'getListeners').to.have.length(2);
        });
    });

    describe('events', function () {
        it('should attach a change listener', function (done) {
            expect(StoreMixin.listeners).to.have.length(0);
            StoreMixin._attachStoreListener(StoreMixin.getListener(mockStore,  function () { done(); }));
            expect(StoreMixin.listeners).to.have.length(1);
            mockStore.emitChange();
        });
    });

    describe('componentWillUnmount', function () {
        it('should remove all change listeners', function () {
            expect(StoreMixin.listeners).to.have.length(1);
            StoreMixin.componentWillUnmount();
            expect(StoreMixin.listeners).to.have.length(0);
        });
    });
});
