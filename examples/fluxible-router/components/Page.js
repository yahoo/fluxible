/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import PageStore from '../stores/PageStore';
import { connectToStores } from 'fluxible-addons-react';

class Page extends React.Component {
    static contextTypes = {
        getStore: React.PropTypes.func,
        executeAction: React.PropTypes.func
    };
    constructor(props, context) {
        super(props, context);
    }
    render() {
        return (
            <p>{this.props.content}</p>
        );
    }
}

Page = connectToStores(Page, [PageStore], (context) => context.getStore(PageStore).getState());

export default Page;
