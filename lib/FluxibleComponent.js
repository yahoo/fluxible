var React = require('react/addons');

var FluxibleComponent = React.createClass({
    displayName: 'FluxibleComponent',
    propTypes: {
        context: React.PropTypes.object.isRequired
    },

    childContextTypes: {
        getStore: React.PropTypes.func,
        executeAction: React.PropTypes.func
    },

    /**
     * Provides the current context as a child context
     * @method getChildContext
     */
    getChildContext: function () {
        return {
            getStore: this.props.context.getStore,
            executeAction: this.props.context.executeAction
        };
    },

    render: function () {
        return React.addons.cloneWithProps(this.props.children, this.props);
    }
});

module.exports = FluxibleComponent;
