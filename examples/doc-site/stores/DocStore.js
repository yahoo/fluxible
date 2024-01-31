/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import { BaseStore } from 'fluxible/addons';

class DocStore extends BaseStore {
    static storeName = 'DocStore';
    static handlers = {
        UPDATE_PAGE_TITLE: '_receiveTitle',
        RECEIVE_DOC_START: '_receiveDocStart',
        RECEIVE_DOC_SUCCESS: '_receiveDocSuccess',
    };

    constructor(dispatcher) {
        super();

        this.docs = {};
        this.current = {};
        this.currentTitle = '';
        this.loading = true;
    }

    _receiveTitle(payload) {
        this.currentTitle = payload.pageTitle;
        this.emitChange();
    }

    _receiveDocStart(doc) {
        this.current = null;
        this.loading = true;
        this.emitChange();
    }

    _receiveDocSuccess(doc) {
        // eslint-disable-next-line no-prototype-builtins
        if (!doc || !doc.hasOwnProperty('key')) {
            return;
        }

        this.docs[doc.key] = doc;
        this.current = doc;
        this.loading = false;
        this.emitChange();
    }

    get(key) {
        return this.docs[key];
    }

    getAll() {
        return this.docs;
    }

    getCurrent() {
        return this.current;
    }

    getCurrentTitle() {
        return this.currentTitle;
    }

    isLoading() {
        return this.loading;
    }

    dehydrate() {
        return {
            docs: this.docs,
            current: this.current,
        };
    }

    rehydrate(state) {
        this.docs = state.docs;
        this.current = state.current;
    }
}

export default DocStore;
