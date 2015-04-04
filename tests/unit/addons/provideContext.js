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
});
