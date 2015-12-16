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
var createMessage = require('../actions/createMessage');
var ENTER_KEY_CODE = 13;

var MessageComposer = React.createClass({

    contextTypes: {
        executeAction: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {text: ''};
    },

    render: function() {
        return (
            <textarea
                className="message-composer"
                name="message"
                value={this.state.text}
                onChange={this._onChange}
                onKeyDown={this._onKeyDown}
            />
        );
    },

    _onChange: function(event, value) {
        this.setState({text: event.target.value});
    },

    _onKeyDown: function(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            event.preventDefault();
            event.stopPropagation();

            var text = this.state.text.trim();
            if (text) {
                this.context.executeAction(createMessage, {
                    text: text
                });
            }
            this.setState({text: ''});
        }
    }

});

module.exports = MessageComposer;
