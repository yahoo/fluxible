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
var MessageSection = require('./MessageSection');
var React = require('react');
var ThreadSection = require('./ThreadSection');
var provideContext = require('fluxible-addons-react/provideContext');
var handleHistory = require('fluxible-router').handleHistory;

var ChatApp = React.createClass({
    render: function() {
        return (
            <div className="chatapp">
                <ThreadSection />
                <MessageSection />
            </div>
        );
    }
});

// wrap with history handler
ChatApp = handleHistory(ChatApp);

// and wrap that with context
ChatApp = provideContext(ChatApp);

module.exports = ChatApp;
