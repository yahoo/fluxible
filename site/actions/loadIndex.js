/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import debugLib from 'debug';
const debug = debugLib('loadIndex');

export default function loadIndex(context, payload, done) {
    debug(payload);

    // Load from service
    context.service.read('search', {}, {}, function (err, data) {
        if (err) {
            done(err);
            return;
        }
        debug('get index from service');
        context.dispatch('RECEIVE_INDEX', data);
        done();
    });
}
