/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var provideContext = require('fluxible-addons-react/provideContext');
var connectToStores = require('fluxible-addons-react/connectToStores');
var TodoStore = require('../stores/TodoStore');
var TodoItem = require('./TodoItem');
var Footer = require('./Footer');
var createTodo = require('../actions/createTodo');
var updateTodo = require('../actions/updateTodo');
var deleteTodo = require('../actions/deleteTodo');
var toggleAll = require('../actions/toggleAll');

var ENTER_KEY = 13;

var TodoApp = React.createClass({
    contextTypes: {
        executeAction: React.PropTypes.func.isRequired
    },
    getInitialState: function () {
        return {
            nowShowing: 'ALL_TODOS'
        };
    },
    handleNewTodoKeyDown: function (event) {
        if (event.which !== ENTER_KEY) {
            return;
        }

        event.preventDefault();

        var text = this.refs.newField.value.trim();

        if (text) {
            this.context.executeAction(createTodo, {
                text: text
            });
            this.refs.newField.value = '';
        }
    },
    changeFilter: function (filter, event) {
        this.setState({ nowShowing: filter });
        event.preventDefault();
    },
    clearCompleted: function () {
        var ids = this.props.items.filter(function (todo) {
            return todo.completed;
        }).map(function (todo) {
            return todo.id;
        });

        this.context.executeAction(deleteTodo, {
            ids: ids
        });
    },
    toggleAll: function (event) {
        var checked = event.target.checked;
        this.context.executeAction(toggleAll, {
            checked: checked
        });
    },
    toggle: function (todo) {
        this.context.executeAction(updateTodo, {
            id: todo.id,
            completed: !todo.completed,
            text: todo.text
        });
    },
    destroy: function (todo) {
        this.context.executeAction(deleteTodo, {
            ids: [todo.id]
        });
    },
    edit: function (todo, callback) {
        // refer TodoItem.handleEdit for the reasoning behind callback
        this.setState({ editing: todo.id }, function () {
            callback();
        });
    },
    save: function (todo, completed, text) {
        this.context.executeAction(updateTodo, {
            id: todo.id,
            completed: completed,
            text: text
        });

        this.setState({ editing: null });
    },
    cancel: function () {
        this.setState({ editing: null });
    },
    render: function() {
        var todos = this.props.items;
        var main;
        var footer;

        var shownTodos = todos.filter(function (todo) {
            switch(this.state.nowShowing) {
                case 'ACTIVE_TODOS':
                    return !todo.completed;
                case 'COMPLETED_TODOS':
                    return todo.completed;
                case 'ALL_TODOS':
                    return true;
            }
        }, this);

        var todoItems = shownTodos.map(function (todo) {
            return (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={this.toggle.bind(this, todo)}
                    onDestroy={this.destroy.bind(this, todo)}
                    onEdit={this.edit.bind(this, todo)}
                    editing={this.state.editing === todo.id}
                    onSave={this.save.bind(this, todo)}
                    onCancel={this.cancel}
                />
            );
        }, this);

        var activeTodoCount = todos.reduce(function (total, todo) {
            return todo.completed ? total : total + 1;
        }, 0);

        var completedCount = todos.length - activeTodoCount;

        if (activeTodoCount || completedCount) {
            footer = <Footer
                count={activeTodoCount}
                completedCount={completedCount}
                nowShowing={this.state.nowShowing}
                onClearCompleted={this.clearCompleted}
                onFilterChange={this.changeFilter}
            />;
        }

        if (todos.length) {
            main = (
                <section id="main">
                    <input
                        id="toggle-all"
                        type="checkbox"
                        onChange={this.toggleAll}
                        checked={activeTodoCount === 0}
                    />
                    <ul id="todo-list">
                        {todoItems}
                    </ul>
                </section>
            );
        }

        return (
            <div>
                <header id="header">
                    <h1>todos</h1>
                    <input
                        ref="newField"
                        id="new-todo"
                        placeholder="What needs to be done?"
                        onKeyDown={this.handleNewTodoKeyDown}
                        autoFocus={true}
                    />
                </header>
                {main}
                {footer}
            </div>
        );
    }
});

TodoApp = connectToStores(TodoApp, [TodoStore], function (context, props) {
    return {
        items: context.getStore(TodoStore).getAll()
    };
});

TodoApp = provideContext(TodoApp);

module.exports = TodoApp;
