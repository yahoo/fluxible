/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import {BaseStore} from 'fluxible/addons';

class ApplicationStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.pageTitle = '';
    }
    updatePageTitle(payload) {
        this.pageTitle = payload.pageTitle;
        this.emitChange();
    }
    getPageTitle() {
        return this.pageTitle;
    }
    getState() {
        return {
            pageTitle: this.pageTitle
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.pageTitle = state.pageTitle;
    }
}

ApplicationStore.storeName = 'ApplicationStore';
ApplicationStore.handlers = {
    'UPDATE_PAGE_TITLE'    : 'updatePageTitle'
};

export default ApplicationStore;
