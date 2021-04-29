/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');
var classNames = require('classnames');


var ESCAPE_KEY = 27;
var ENTER_KEY = 13;


var Component = React.createClass({
    getInitialState: function () {
        return { editText: this.props.todo.text };
    },
    handleSubmit: function (event) {
        var completed = this.props.todo.completed;
        var text = this.state.editText.trim();

        if (text) {
            this.props.onSave(completed, text);
            this.setState({ editText: text });
        }
        else {
            this.props.onDestroy();
        }
    },
    handleEdit: function () {
        this.props.onEdit(function () {
            var node = this.refs.editField.getDOMNode();
            node.focus();
            node.setSelectionRange(node.value.length, node.value.length);
        }.bind(this));

        this.setState({ editText: this.props.todo.text });
    },
    handleKeyDown: function (event) {
        if (event.which === ESCAPE_KEY) {
            this.setState({ editText: this.props.todo.text });
            this.props.onCancel(event);
        }
        else if (event.which === ENTER_KEY) {
            this.refs.editField.getDOMNode().blur();
        }
    },
    handleChange: function (event) {
        this.setState({ editText: event.target.value });
    },
    render: function () {
        var classSet = classNames({
            completed: this.props.todo.completed,
            editing: this.props.editing,
            pending: this.props.todo.pending,
            failure: this.props.todo.failure
        });

        return (
            <li className={classSet}>
                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={this.props.todo.completed}
                        onChange={this.props.onToggle}
                        disabled={this.props.todo.failure}
                    />
                    <label onDoubleClick={this.props.todo.failure ? undefined : this.handleEdit}>
                        {this.props.todo.text}
                    </label>
                    <button
                        className="destroy"
                        onClick={this.props.onDestroy}
                        disabled={this.props.todo.failure}
                    />
                </div>
                <input
                    ref="editField"
                    className="edit"
                    value={this.state.editText}
                    onBlur={this.handleSubmit}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                />
            </li>
        );
    }
});


module.exports = Component;
