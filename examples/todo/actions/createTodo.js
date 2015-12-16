/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var TodoStore = require('../stores/TodoStore');


module.exports = function (context, payload, done) {
    var todoStore = context.getStore(TodoStore);
    var newTodo = todoStore.createTodo({
        timestamp: Date.now(),
        text: payload.text
    });

    context.dispatch('CREATE_TODO_START', newTodo);

    context.service.create('todo', newTodo, {}, function (err, todo) {
        if (err) {
            context.dispatch('CREATE_TODO_FAILURE', newTodo);
            done();
            return;
        }

        context.dispatch('CREATE_TODO_SUCCESS', todo);
        done();
    });
};
