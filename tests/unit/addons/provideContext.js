/*globals describe,it*/
'use strict';

var expect = require('chai').expect;
var React = require('react');
var provideContext = require('../../../addons/provideContext');

describe('provideContext', function () {
    it('should provide the context with custom types to children', function () {
        var context = {
            foo: 'bar',
            executeAction: function () {},
            getStore: function () {}
        };
        var Component = React.createClass({
            contextTypes: {
                foo: React.PropTypes.string.isRequired,
                executeAction: React.PropTypes.func.isRequired,
                getStore: React.PropTypes.func.isRequired
            },
            render: function () {
                expect(this.context.foo).to.equal(context.foo);
                expect(this.context.executeAction).to.equal(context.executeAction);
                expect(this.context.getStore).to.equal(context.getStore);
                return null;
            }
        });
        var WrappedComponent = provideContext(Component, {
            foo: React.PropTypes.string
        });

        React.renderToString(<WrappedComponent context={context} />);
    });

    it('should hoist non-react statics to higher order component', function () {
        var context = {
            foo: 'bar',
            executeAction: function () {},
            getStore: function () {}
        };
        var Component = React.createClass({
            displayName: 'Component',
            statics: {
                initAction: function () {}
            },
            render: function () {
                expect(this.context.foo).to.equal(context.foo);
                expect(this.context.executeAction).to.equal(context.executeAction);
                expect(this.context.getStore).to.equal(context.getStore);
                return null;
            }
        });
        var WrappedComponent = provideContext(Component, {
            foo: React.PropTypes.string
        });

        expect(WrappedComponent.initAction).to.be.a('function');
        expect(WrappedComponent.displayName).to.not.equal(Component.displayName);
    });

    it('should provide the context with custom types to children using the decorator pattern', function () {
        var context = {
            foo: 'bar',
            executeAction: function () {},
            getStore: function () {}
        };
        @provideContext({
            foo: React.PropTypes.string
        })
        class WrappedComponent extends React.Component {
            static contextTypes = {
                foo: React.PropTypes.string.isRequired,
                executeAction: React.PropTypes.func.isRequired,
                getStore: React.PropTypes.func.isRequired
            }
            render() {
                expect(this.context.foo).to.equal(context.foo);
                expect(this.context.executeAction).to.equal(context.executeAction);
                expect(this.context.getStore).to.equal(context.getStore);
                return null;
            }
        }

        React.renderToString(<WrappedComponent context={context} />);
    });
});
