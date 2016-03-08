import React from 'react';
import ApplicationStore from '../stores/ApplicationStore';

export default function Html(props) {
    return (
        <html>
        <head>
            <meta charSet="utf-8" />
            <title>{props.context.getStore(ApplicationStore).getPageTitle()}</title>
            <meta name="viewport" content="width=device-width, user-scalable=no" />
            <link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/pure-min.css" />
        </head>
        <body>
            <div id="app" dangerouslySetInnerHTML={{__html: props.markup}}></div>
            <script dangerouslySetInnerHTML={{__html: props.state}}></script>
            <script src={'/public/js/' + props.clientFile}></script>
        </body>
        </html>
    );
};
