/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
const React = require('react');
const classNames = require('classnames');

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editText: this.props.todo.text };
        this.editField = React.createRef();

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit() {
        const completed = this.props.todo.completed;
        const text = this.state.editText.trim();

        if (text) {
            this.props.onSave(completed, text);
            this.setState({ editText: text });
        } else {
            this.props.onDestroy();
        }
    }

    handleEdit() {
        this.props.onEdit(
            function () {
                const node = this.editField.current;
                node.focus();
                node.setSelectionRange(node.value.length, node.value.length);
            }.bind(this),
        );

        this.setState({ editText: this.props.todo.text });
    }

    handleKeyDown(event) {
        if (event.which === ESCAPE_KEY) {
            this.setState({ editText: this.props.todo.text });
            this.props.onCancel(event);
        } else if (event.which === ENTER_KEY) {
            this.editField.current.blur();
        }
    }

    handleChange(event) {
        this.setState({ editText: event.target.value });
    }

    render() {
        const classSet = classNames({
            completed: this.props.todo.completed,
            editing: this.props.editing,
            pending: this.props.todo.pending,
            failure: this.props.todo.failure,
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
                    <label
                        onDoubleClick={
                            this.props.todo.failure
                                ? undefined
                                : this.handleEdit
                        }
                    >
                        {this.props.todo.text}
                    </label>
                    <button
                        className="destroy"
                        onClick={this.props.onDestroy}
                        disabled={this.props.todo.failure}
                    />
                </div>
                <input
                    ref={this.editField}
                    className="edit"
                    value={this.state.editText}
                    onBlur={this.handleSubmit}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                />
            </li>
        );
    }
}

module.exports = Component;
