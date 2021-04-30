/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';


module.exports = function (context, payload, done) {
    var todo = payload;
    todo.pending = true;

    context.dispatch('UPDATE_TODO_START', todo);

    context.service.update('todo', todo, {}, function (err, theTodo) {
        if (err) {
            context.dispatch('UPDATE_TODO_FAILURE', todo);
            done();
            return;
        }

        context.dispatch('UPDATE_TODO_SUCCESS', theTodo);
        done();
    });
};
