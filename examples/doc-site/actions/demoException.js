/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

export default function demoException(context, route, done) {
    done(new Error('Whoops!'));
}
