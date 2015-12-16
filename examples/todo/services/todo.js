/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';


var _todos = [];
var randomResponseTime = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


module.exports = {
    name: 'todo',
    read: function (req, resource, params, config, callback) {
        setTimeout(function () {
            callback(null, _todos.concat());
        }, randomResponseTime(100, 1000));
    },
    create: function (req, resource, params, body, config, callback) {
        var newTodo = {
            id: params.id,
            text: params.text
        };

        if (params.text.indexOf('fail') > -1) {
            var err = new Error('Shenanigans');
            setTimeout(function () {
                callback(err);
            }, randomResponseTime(800, 1000));
            return;
        }
        else {
            _todos.push(newTodo);

            setTimeout(function () {
                callback(null, newTodo);
            }, randomResponseTime(100, 1000));
        }
    },
    update: function (req, resource, params, body, config, callback) {
        if (resource === 'todo.toggleAll') {
            _todos.forEach(function (todo, index) {
                todo.completed = params.checked;
            });

            setTimeout(function () {
                callback(null, _todos);
            }, randomResponseTime(100, 1000));
        }
        else {
            var foundTodo;

            _todos.forEach(function (todo, index) {
                if (params.id === todo.id) {
                    todo.text = params.text;
                    todo.completed = params.completed;
                    _todos[index] = todo;
                    foundTodo = todo;
                }
            });

            setTimeout(function () {
                callback(null, foundTodo);
            }, randomResponseTime(100, 1000));
        }
    },
    delete: function(req, resource, params, config, callback) {
        _todos = _todos.filter(function (todo, index) {
            return params.ids.indexOf(todo.id) === -1;
        });

        setTimeout(function () {
            callback(null, _todos);
        }, randomResponseTime(100, 1000));
    }
};
