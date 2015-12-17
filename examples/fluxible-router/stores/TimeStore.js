/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import {BaseStore} from 'fluxible/addons';

class TimeStore extends BaseStore {
    constructor(dispatcher) {
        super(dispatcher);
        this.time = new Date();
    }
    handleTimeChange(payload) {
        this.time = new Date();
        this.emitChange();
    }
    getState() {
        return {
            time: this.time.toString()
        };
    }
    dehydrate() {
        return this.getState();
    }
    rehydrate(state) {
        this.time = new Date(state.time);
    }
}

TimeStore.storeName = 'TimeStore';
TimeStore.handlers = {
    'NAVIGATE_START': 'handleTimeChange',
    'UPDATE_TIME': 'handleTimeChange'
};

export default TimeStore;
