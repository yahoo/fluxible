/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var React = require('react');

function Component(props) {
    var nowShowing = props.nowShowing;
    var onFilterChange = props.onFilterChange;
    var activeTodoLabel = 'item' + (props.count > 1 ? 's' : '');
    var clearButton;

    if (props.completedCount > 0) {
        clearButton = (
            <button id="clear-completed" onClick={props.onClearCompleted}>
                Clear completed ({props.completedCount})
            </button>
        );
    }

    return (
        <footer id="footer">
            <span id="todo-count">
                <strong>{props.count}</strong> {activeTodoLabel} left
            </span>
            <ul id="filters">
                <li>
                    <a
                        href="#"
                        onClick={onFilterChange.bind(null, 'ALL_TODOS')}
                        className={nowShowing === 'ALL_TODOS' ? 'selected' : ''}
                    >
                        All
                    </a>
                </li>{' '}
                <li>
                    <a
                        href="#"
                        onClick={onFilterChange.bind(null, 'ACTIVE_TODOS')}
                        className={
                            nowShowing === 'ACTIVE_TODOS' ? 'selected' : ''
                        }
                    >
                        Active
                    </a>
                </li>{' '}
                <li>
                    <a
                        href="#"
                        onClick={onFilterChange.bind(null, 'COMPLETED_TODOS')}
                        className={
                            nowShowing === 'COMPLETED_TODOS' ? 'selected' : ''
                        }
                    >
                        Completed
                    </a>
                </li>
            </ul>
            {clearButton}
        </footer>
    );
}

module.exports = Component;
