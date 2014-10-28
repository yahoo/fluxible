/** @jsx React.DOM */
/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var React = require('react/addons'),
    Nav = require('./Nav.jsx'),
    Home = require('./Home.jsx'),
    About = require('./About.jsx'),
    Timestamp = require('./Timestamp.jsx'),
    RouterMixin = require('flux-router-component').RouterMixin,
    StoreMixin = require(__dirname + '/../../../../../mixins/StoreMixin'),
    ApplicationStore = require('../stores/ApplicationStore');

var Application = React.createClass({
    mixins: [RouterMixin, StoreMixin],
    statics: {
        listeners: [ApplicationStore]
    },
    getInitialState: function () {
         return this.getStoreState();
    },
    getStoreState: function () {
        return this.getStore(ApplicationStore).getState();
    },
    onUpdate: function () {
        this.setState(this.getStoreState());
    },
    render: function () {
        return (
            <div>
                <Nav selected={this.state.currentPageName} links={this.state.pages} context={this.props.context}/>
                {'home' === this.state.currentPageName ? <Home/> : <About/>}
                <Timestamp context={this.props.context}/>
            </div>
        );
    }
});

module.exports = Application;
