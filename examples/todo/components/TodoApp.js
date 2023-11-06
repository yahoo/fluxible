/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
const React = require('react');
const { provideContext, connectToStores } = require('fluxible-addons-react');
const TodoStore = require('../stores/TodoStore');
const TodoItem = require('./TodoItem');
const Footer = require('./Footer');
const createTodo = require('../actions/createTodo');
const updateTodo = require('../actions/updateTodo');
const deleteTodo = require('../actions/deleteTodo');
const toggleAll = require('../actions/toggleAll');

const ENTER_KEY = 13;

class TodoApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = { nowShowing: 'ALL_TODOS' };
        this.handleNewTodoKeyDown = this.handleNewTodoKeyDown.bind(this);
        this.toggleAll = this.toggleAll.bind(this);
        this.clearCompleted = this.clearCompleted.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
        this.newField = React.createRef();
    }

    handleNewTodoKeyDown(event) {
        if (event.which !== ENTER_KEY) {
            return;
        }

        event.preventDefault();

        const text = this.newField.current.value.trim();

        if (text) {
            this.props.context.executeAction(createTodo, {
                text: text,
            });
            this.newField.current.value = '';
        }
    }

    changeFilter(filter, event) {
        this.setState({ nowShowing: filter });
        event.preventDefault();
    }

    clearCompleted() {
        const ids = this.props.items
            .filter(function (todo) {
                return todo.completed;
            })
            .map(function (todo) {
                return todo.id;
            });

        this.props.context.executeAction(deleteTodo, {
            ids: ids,
        });
    }

    toggleAll(event) {
        const checked = event.target.checked;
        this.props.context.executeAction(toggleAll, {
            checked: checked,
        });
    }

    toggle(todo) {
        this.props.context.executeAction(updateTodo, {
            id: todo.id,
            completed: !todo.completed,
            text: todo.text,
        });
    }

    destroy(todo) {
        this.props.context.executeAction(deleteTodo, {
            ids: [todo.id],
        });
    }

    edit(todo, callback) {
        // refer TodoItem.handleEdit for the reasoning behind callback
        this.setState({ editing: todo.id }, function () {
            callback();
        });
    }

    save(todo, completed, text) {
        this.props.context.executeAction(updateTodo, {
            id: todo.id,
            completed: completed,
            text: text,
        });

        this.setState({ editing: null });
    }

    cancel() {
        this.setState({ editing: null });
    }

    render() {
        const todos = this.props.items;
        var main;
        var footer;

        const shownTodos = todos.filter(function (todo) {
            switch (this.state.nowShowing) {
                case 'ACTIVE_TODOS':
                    return !todo.completed;
                case 'COMPLETED_TODOS':
                    return todo.completed;
                case 'ALL_TODOS':
                    return true;
            }
        }, this);

        const todoItems = shownTodos.map(function (todo) {
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

        const activeTodoCount = todos.reduce(function (total, todo) {
            return todo.completed ? total : total + 1;
        }, 0);

        const completedCount = todos.length - activeTodoCount;

        if (activeTodoCount || completedCount) {
            footer = (
                <Footer
                    count={activeTodoCount}
                    completedCount={completedCount}
                    nowShowing={this.state.nowShowing}
                    onClearCompleted={this.clearCompleted}
                    onFilterChange={this.changeFilter}
                />
            );
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
                    <ul id="todo-list">{todoItems}</ul>
                </section>
            );
        }

        return (
            <div>
                <header id="header">
                    <h1>todos</h1>
                    <input
                        ref={this.newField}
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
}

module.exports = provideContext(
    connectToStores(TodoApp, [TodoStore], (context) => ({
        items: context.getStore(TodoStore).getAll(),
        context,
    })),
);
