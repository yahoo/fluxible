/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';


module.exports = function (context, payload, done) {
    context.dispatch('RECEIVE_TODOS_START', payload);
    context.dispatch('UPDATE_PAGE_TITLE', 'showTodos | flux-examples');

    context.service.read('todo', {}, {}, function (err, todos) {
        if (err) {
            context.dispatch('RECEIVE_TODOS_FAILURE', payload);
            done();
            return;
        }
        context.dispatch('RECEIVE_TODOS_SUCCESS', todos);
        done();
    });
};
