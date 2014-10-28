/** @jsx React.DOM */
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var React = require('react/addons'),
    updateTime = require('../actions/updateTime');

var Timestamp = React.createClass({
    getInitialState: function () {
        this.store = this.props.context.getStore('TimeStore');
        return this.store.getState();
    },
    componentDidMount: function() {
        var self = this;
        this.store.on('change', function () {
            var state = self.store.getState();
            self.setState(state);
        });
    },
    onReset: function (event) {
        this.props.context.executeAction(updateTime);
    },
    render: function() {
        return (
            <em onClick={this.onReset} style={{'font-size': '.8em'}}>{this.state.time}</em>
        );
    }
});

module.exports = Timestamp;
