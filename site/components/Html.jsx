/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import { provideContext, connectToStores } from 'fluxible-addons-react';

@provideContext
@connectToStores(['DocStore'], (context) => ({
    currentTitle: context.getStore('DocStore').getCurrentTitle() || '',
    currentDoc: context.getStore('DocStore').getCurrent() || {}
}))
class Html extends React.Component {
    render() {
        return (
            <html id="atomic" className="atomic">
                <head>
                    <meta charSet="utf-8" />
                    <title>{this.props.currentTitle}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="stylesheet" href="http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" />
                    <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Nobile" />
                    <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Montserrat" />
                    <link rel="stylesheet" href="/public/css/bundle.css" />
                    <script dangerouslySetInnerHTML={{__html: this.props.tracking}}></script>
                </head>
                <body className="Mih(100%)">
                    <div id="docsapp" className="H(100%)" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
                    <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
                    <script src={this.props.assets.common}></script>
                    <script src={this.props.assets.main}></script>
                </body>
            </html>
        );
    }
}

export default Html;
