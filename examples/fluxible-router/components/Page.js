/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import PageStore from '../stores/PageStore';
import { connectToStores } from 'fluxible-addons-react';

const Page = ({ content }) => <p>{content}</p>;

export default connectToStores(Page, [PageStore], (context) =>
    context.getStore(PageStore).getState(),
);
