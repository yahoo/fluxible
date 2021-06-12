/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const React = require('react');
const PropTypes = require('prop-types');

/**
 * Stateless React component to handle the rendering of the HTML head section
 */
const Html = (props) => (
    <html>
        <head>
            <meta charSet="utf-8" />
            <title>{props.title}</title>
            <meta
                name="viewport"
                content="width=device-width, user-scalable=no"
            />
            <link rel="stylesheet" href="/assets/styles.css" />
        </head>
        <body>
            <div
                id="app"
                dangerouslySetInnerHTML={{ __html: props.markup }}
            ></div>
            <script dangerouslySetInnerHTML={{ __html: props.state }}></script>
            <script src="/public/js/client.js" defer></script>
        </body>
    </html>
);

Html.propTypes = {
    title: PropTypes.object,
    markup: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
};

module.exports = Html;
