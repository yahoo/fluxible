/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import PropTypes from 'prop-types';

const HtmlComponent = ({ helmet, markup, state }) => (
    <html>
        <head>
            <meta charSet="utf-8" />
            {helmet.title.toComponent()}
            <meta
                name="viewport"
                content="width=device-width, user-scalable=no"
            />
            <link
                rel="stylesheet"
                href="http://yui.yahooapis.com/pure/0.5.0/pure-min.css"
            />
        </head>
        <body>
            <div id="app" dangerouslySetInnerHTML={{ __html: markup }} />
            <script dangerouslySetInnerHTML={{ __html: state }}></script>
            <script src="/public/js/client.js" defer></script>
        </body>
    </html>
);

HtmlComponent.propTypes = {
    helmet: PropTypes.object.isRequired,
    markup: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
};

export default HtmlComponent;
