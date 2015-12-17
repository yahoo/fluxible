/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var PageStore = require('../stores/PageStore');

var Component = React.createClass({
    render: function() {
        return (
            <html>
            <head>
                <meta charSet="utf-8" />
                <title>{this.props.context.getStore(PageStore).getPageTitle()}</title>
                <meta name="viewport" content="width=device-width, user-scalable=no" />
                <link rel="stylesheet" href="/assets/todomvc-common/base.css" />
                <link rel="stylesheet" href="/assets/styles.css" />
            </head>
            <body>
                <section id="todoapp" dangerouslySetInnerHTML={{__html: this.props.markup}}></section>
                <footer id="info">
                    <p>Double-click to edit a todo</p>
                    <p>Some assets from <a href="http://todomvc.com">TodoMVC</a></p>
                    <p>Some code inspried by <a href="http://todomvc.com/examples/react/">TodoMVC React (Pete Hunt)</a></p>
                    <p>Showing off <a href="http://fluxible.io">Fluxible</a></p>
                </footer>
                <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
                <script src="/public/js/client.js" defer></script>
            </body>
            </html>
        );
    }
});


module.exports = Component;
