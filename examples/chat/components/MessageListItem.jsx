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

var ReactPropTypes = React.PropTypes;

var MessageListItem = function (props) {
    var message = props.message;
    return (
        <li className="message-list-item">
            <h5 className="message-author-name">{message.authorName}</h5>
            <div className="message-time">
                {(new Date(message.timestamp)).toTimeString()}
            </div>
            <div className="message-text">{message.text}</div>
        </li>
    );
};

MessageListItem.propTypes = {
    message: ReactPropTypes.object
};

module.exports = MessageListItem;
