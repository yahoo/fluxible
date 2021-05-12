import React from 'react';
import PropTypes from 'prop-types';
import ApplicationStore from '../stores/ApplicationStore';

const Html = ({ context, markup, state, clientFile }) => (
    <html>
        <head>
            <meta charSet="utf-8" />
            <title>{context.getStore(ApplicationStore).getPageTitle()}</title>
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
            <div id="app" dangerouslySetInnerHTML={{ __html: markup }}></div>
            <script dangerouslySetInnerHTML={{ __html: state }}></script>
            <script src={`/public/${clientFile}`}></script>
        </body>
    </html>
);

Html.propTypes = {
    clientFile: PropTypes.string,
    context: PropTypes.object,
    markup: PropTypes.string,
    state: PropTypes.string,
};

export default Html;
