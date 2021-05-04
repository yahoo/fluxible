/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
export default function (context, payload, done) {
    context.dispatch('UPDATE_TIME');
    done();
};
