/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var React = require('react');
var MessageStore = require('../stores/MessageStore');
var ThreadListItem = require('../components/ThreadListItem.jsx');
var ThreadStore = require('../stores/ThreadStore');
var UnreadThreadStore = require('../stores/UnreadThreadStore');
var connectToStores = require('fluxible-addons-react/connectToStores');
var NavLink = require('fluxible-router').NavLink;

var ThreadSection = React.createClass({

    render: function() {
        var threadListItems = this.props.threads.map(function(thread) {
            return (
                <NavLink href={"/thread/" + thread.id} key={thread.id}>
                    <ThreadListItem
                        key={thread.id}
                        thread={thread}
                    />
                </NavLink>
            );
        }, this);
        var unread =
            this.props.unreadCount === 0 ?
                null :
                <span>Unread threads: {this.props.unreadCount}</span>;
        return (
            <div className="thread-section">
                <div className="thread-count">
                    {unread}
                </div>
                <ul className="thread-list">
                    {threadListItems}
                </ul>
            </div>
        );
    }

});

module.exports = connectToStores(
    ThreadSection,
    [ThreadStore, UnreadThreadStore],
    function (context, props) {
        return {
            currentThreadID: context.getStore(ThreadStore).getCurrentID(),
            threads: context.getStore(ThreadStore).getAllChrono(),
            unreadCount: context.getStore(UnreadThreadStore).getCount()
        }
    }
);
