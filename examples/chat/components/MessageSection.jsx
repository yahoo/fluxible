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
var MessageComposer = require('./MessageComposer.jsx');
var MessageListItem = require('./MessageListItem.jsx');
var MessageStore = require('../stores/MessageStore');
var ThreadStore = require('../stores/ThreadStore');
var connectToStores = require('fluxible-addons-react/connectToStores');

function getMessageListItem(message) {
    return (
        <MessageListItem
            key={message.id}
            message={message}
        />
    );
}

var MessageSection = React.createClass({

    componentDidMount: function() {
        this._scrollToBottom();
    },

    render: function() {
        var messageListItems = this.props.messages.map(getMessageListItem);
        return (
            <div className="message-section">
                <h3 className="message-thread-heading">{this.props.thread && this.props.thread.name}</h3>
                <ul className="message-list" ref="messageList">
                    {messageListItems}
                </ul>
                <MessageComposer />
            </div>
        );
    },

    componentDidUpdate: function() {
        this._scrollToBottom();
    },

    _scrollToBottom: function() {
        var ul = this.refs.messageList;
        ul.scrollTop = ul.scrollHeight;
    }

});

module.exports = connectToStores(
    MessageSection,
    [ThreadStore, MessageStore],
    function (context, props) {
        return {
            messages: context.getStore(MessageStore).getAllForCurrentThread(),
            thread: context.getStore(ThreadStore).getCurrent()
        }
    }
);
