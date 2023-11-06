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
const React = require('react');
const ThreadListItem = require('../components/ThreadListItem');
const ThreadStore = require('../stores/ThreadStore');
const UnreadThreadStore = require('../stores/UnreadThreadStore');
const { connectToStores } = require('fluxible-addons-react');
const { NavLink } = require('fluxible-router');

const ThreadSection = (props) => {
    const threadListItems = props.threads.map((thread) => (
        <NavLink href={'/thread/' + thread.id} key={thread.id}>
            <ThreadListItem key={thread.id} thread={thread} />
        </NavLink>
    ));

    const unread =
        props.unreadCount === 0 ? null : (
            <span>Unread threads: {props.unreadCount}</span>
        );

    return (
        <div className="thread-section">
            <div className="thread-count">{unread}</div>
            <ul className="thread-list">{threadListItems}</ul>
        </div>
    );
};

module.exports = connectToStores(
    ThreadSection,
    [ThreadStore, UnreadThreadStore],
    (context) => ({
        currentThreadID: context.getStore(ThreadStore).getCurrentID(),
        threads: context.getStore(ThreadStore).getAllChrono(),
        unreadCount: context.getStore(UnreadThreadStore).getCount(),
    }),
);
