/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';


module.exports = function (context, payload, done) {
    context.dispatch('DELETE_TODO_START', payload);

    context.service.delete('todo', payload, {}, function (err, todos) {
        if (err) {
            context.dispatch('DELETE_TODO_FAILURE', payload);
            done();
            return;
        }

        context.dispatch('DELETE_TODO_SUCCESS', todos);
        done();
    });
};
