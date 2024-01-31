/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import debugLib from 'debug';
import { BaseStore } from 'fluxible/addons';
import lunr from 'lunr';

const debug = debugLib('SearchStore');

class SearchStore extends BaseStore {
    static storeName = 'SearchStore';
    static handlers = {
        RECEIVE_INDEX: '_receiveIndex',
        DO_SEARCH: '_doSearch',
    };

    constructor(dispatcher) {
        super();

        this.docs = null;
        this.index = null;
        this.query = null;
        this.results = [];
    }

    _receiveIndex(payload) {
        debug('Receive index', payload);
        this.docs = payload.docs;
        this.index = lunr.Index.load(payload.index);
        this.emitChange();
    }

    _doSearch(query) {
        debug('Seaching');
        this.query = query;
        if (this.index) {
            // perform search, grab each doc and only return first 10
            this.results = this.index
                .search(query)
                .map((result) => this.docs[result.ref])
                .slice(0, 10);
            debug('Search complete');
        }
        this.emitChange();
    }

    getDocs() {
        return this.docs;
    }

    getIndex() {
        return this.index;
    }

    getQuery() {
        return this.query;
    }

    getState() {
        return {
            docs: this.docs,
            index: this.index,
            query: this.query,
            results: this.results,
        };
    }
}

export default SearchStore;
