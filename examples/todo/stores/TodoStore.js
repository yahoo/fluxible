/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var createStore = require('fluxible/addons').createStore;


module.exports = createStore({
    storeName: 'TodoStore',
    handlers: {
        'RECEIVE_TODOS_SUCCESS': '_receiveTodos',
        'CREATE_TODO_START': '_createTodoStart',
        'CREATE_TODO_FAILURE': '_createTodoFailure',
        'CREATE_TODO_SUCCESS': '_createTodoSuccess',
        'UPDATE_TODO_START': '_updateTodoStart',
        'UPDATE_TODO_SUCCESS': '_updateTodoSuccess',
        'DELETE_TODO_SUCCESS': '_receiveTodos',
        'TOGGLE_ALL_TODO_SUCCESS': '_receiveTodos'
    },
    initialize: function () {
        this.todos = [];
    },
    _receiveTodos: function (todos) {
        this.todos = todos;
        this.emitChange();
    },
    _createTodoStart: function (todo) {
        this.todos.push(todo);
        this.emitChange();
    },
    _createTodoSuccess: function (newTodo) {
        this.todos.forEach(function (todo, index) {
            if (todo.id === newTodo.id) {
                this.todos.splice(index, 1, newTodo);
            }
        }, this);

        this.emitChange();
    },
    _createTodoFailure: function (failedTodo) {
        this.todos.forEach(function (todo, index) {
            if (todo.id === failedTodo.id) {
                todo.failure = true;
            }
        }, this);

        this.emitChange();
    },
    _updateTodoStart: function (theTodo) {
        this.todos.forEach(function (todo, index) {
            if (todo.id === theTodo.id) {
                this.todos.splice(index, 1, theTodo);
            }
        }, this);

        this.emitChange();
    },
    _updateTodoSuccess: function (theTodo) {
        this.todos.forEach(function (todo, index) {
            if (todo.id === theTodo.id) {
                this.todos.splice(index, 1, theTodo);
            }
        }, this);

        this.emitChange();
    },
    getAll: function () {
        return this.todos;
    },
    createTodo: function(details) {
        return {
            id: String('td_' + details.timestamp),
            editing: false,
            completed: false,
            text: String(details.text),
            pending: true
        };
    },
    dehydrate: function () {
        return {
            todos: this.todos
        };
    },
    rehydrate: function (state) {
        this.todos = state.todos;
    }
});
