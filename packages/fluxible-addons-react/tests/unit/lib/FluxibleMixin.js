/*globals describe,it,afterEach,beforeEach*/
'use strict';

var expect = require('chai').expect,
    React = require('react'),
    ReactDOM =require('react-dom/server'),
    ReactTestUtils = require('react-addons-test-utils'),
    provideContext = require('../../../provideContext'),
    FluxibleMixin = require('../../../').FluxibleMixin,
    createStore = require('fluxible/addons/createStore'),
    createMockComponentContext = require('fluxible/utils/createMockComponentContext'),
    jsdom = require('jsdom');

var MockStore = createStore({
        storeName: 'FooStore'
    }),
    MockStore2 = createStore({
        storeName: 'BarStore'
    });

describe('fluxible-addons-react', function () {
    describe('FluxibleMixin', function () {
        var context,
            mockStore,
            mockStore2;

        beforeEach(function (done) {
            context = createMockComponentContext({
                stores: [MockStore, MockStore2]
            });
            mockStore = context.getStore(MockStore);
            mockStore2 = context.getStore(MockStore2);
            jsdom.env('<html><body></body></html>', [], function (err, window) {
                if (err) {
                    done(err);
                    return;
                }
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
                expect(FluxibleMixin._fluxible_listeners).to.not.exist;
                FluxibleMixin.componentDidMount();
                expect(FluxibleMixin._fluxible_listeners).to.exist;
                expect(FluxibleMixin._fluxible_listeners).to.be.empty;
            });
            it('should register static listener array', function (done) {
                var Component = provideContext(React.createClass({
                    mixins: [FluxibleMixin],
                    statics: {
                        storeListeners: [MockStore]
                    },
                    onChange: function () {
                        done();
                    },
                    render: function () {
                        return null;
                    }
                }));
                var component = ReactTestUtils.renderIntoDocument(<Component
                    context={context}/>);
                expect(component.refs.wrappedElement._fluxible_listeners).to.have.length(1);
                mockStore.emitChange();
            });
            it('should register static listener object', function (done) {
                var Component = provideContext(React.createClass({
                    mixins: [FluxibleMixin],
                    statics: {
                        storeListeners: {
                            'onChange2': MockStore
                        }
                    },
                    onChange2: function () {
                        done();
                    },
                    render: function () {
                        return null;
                    }
                }));
                var component = ReactTestUtils.renderIntoDocument(<Component
                    context={context}/>);
                expect(component.refs.wrappedElement._fluxible_listeners).to.have.length(1);
                mockStore.emitChange();
            });
            it('should register static listener object with array', function (done) {
                var Component = provideContext(React.createClass({
                    mixins: [FluxibleMixin],
                    statics: {
                        storeListeners: {
                            'onChange2': [MockStore]
                        }
                    },
                    onChange2: function () {
                        done();
                    },
                    render: function () {
                        return null;
                    }
                }));
                var component = ReactTestUtils.renderIntoDocument(<Component
                    context={context}/>);
                expect(component.refs.wrappedElement._fluxible_listeners).to.have.length(1);
                mockStore.emitChange();
            });
        });

        describe('iterating over storeListeners', function () {
            it('should expose iterables for static listener array', function () {
                var Component = provideContext(React.createClass({
                    mixins: [FluxibleMixin],
                    statics: {
                        storeListeners: [MockStore, MockStore2]
                    },
                    onChange: function () {
                    },
                    render: function () {
                        return null;
                    }
                }));
                var component = ReactTestUtils.renderIntoDocument(<Component
                    context={context}/>);
                expect(component.refs.wrappedElement.getStores(), 'getStores').to.have.length(2);
                expect(component.refs.wrappedElement.getListeners(), 'getListeners').to.have.length(2);
            });
            it('should expose iterables for static listener object', function () {
                var Component = provideContext(React.createClass({
                    mixins: [FluxibleMixin],
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
                    render: function () {
                        return null;
                    }
                }));
                var component = ReactTestUtils.renderIntoDocument(<Component
                    context={context}/>);
                expect(component.refs.wrappedElement.getStores(), 'getStores').to.have.length(2);
                expect(component.refs.wrappedElement.getListeners(), 'getListeners').to.have.length(2);
            });
            it('should expose iterables for static listener object with array', function () {
                var Component = provideContext(React.createClass({
                    mixins: [FluxibleMixin],
                    statics: {
                        storeListeners: {
                            'onChange2': [MockStore, MockStore2]
                        }
                    },
                    onChange2: function () {
                    },
                    render: function () {
                        return null;
                    }
                }));
                var component = ReactTestUtils.renderIntoDocument(<Component
                    context={context}/>);
                expect(component.refs.wrappedElement.getStores(), 'getStores').to.have.length(2);
                expect(component.refs.wrappedElement.getListeners(), 'getListeners').to.have.length(2);
            });
        });

        describe('events', function () {
            it('should attach a change listener', function (done) {
                expect(FluxibleMixin._fluxible_listeners).to.have.length(0);
                FluxibleMixin._attachStoreListener(FluxibleMixin.getListener(mockStore, function () {
                    done();
                }));
                expect(FluxibleMixin._fluxible_listeners).to.have.length(1);
                mockStore.emitChange();
            });
        });

        describe('componentWillUnmount', function () {
            it('should remove all change listeners', function () {
                expect(FluxibleMixin._fluxible_listeners).to.have.length(1);
                FluxibleMixin.componentWillUnmount();
                expect(FluxibleMixin._fluxible_listeners).to.have.length(0);
            });
        });

        describe('executeAction', function () {
            it('should throw when no context provided', function () {
                var Component = React.createClass({
                    mixins: [FluxibleMixin],
                    getInitialState: function () {
                        this.executeAction(function () {
                        }, 2, function () {
                        });
                        return {};
                    },
                    render: function () {
                        return null;
                    }
                });

                expect(function () {
                    ReactTestUtils.renderIntoDocument(<Component />);
                }).to['throw']();
            });
            it('should call context executeAction when context provided', function (done) {
                var Component = React.createClass({
                    mixins: [FluxibleMixin],
                    componentDidMount: function () {
                        this.executeAction(function () {
                            expect(context.executeActionCalls).to.have.length(1);
                            done();
                        }, 2);
                    },
                    render: function () {
                        return null;
                    }
                });
                ReactTestUtils.renderIntoDocument(<Component
                    context={context}/>);

            });
            it('should call context executeAction when context provided via React context', function (done) {
                var FluxibleComponent = require('../../../').FluxibleComponent;
                var Component = React.createClass({
                    displayName: 'Component',
                    contextTypes: {
                        executeAction: React.PropTypes.func.isRequired
                    },
                    componentDidMount: function () {
                        this.context.executeAction(function () {
                            expect(context.executeActionCalls).to.have.length(1);
                            done();
                        }, 2);
                    },
                    render: function () {
                        return null;
                    }
                });
                ReactTestUtils.renderIntoDocument(
                    <FluxibleComponent context={context}>
                        <Component />
                    </FluxibleComponent>
                );
            });
        });
    });
});
