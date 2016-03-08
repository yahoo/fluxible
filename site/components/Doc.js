/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import { navigateAction } from 'fluxible-router';
import { ReactI13n, createI13nNode, I13nAnchor, I13nDiv} from 'react-i13n';

function createDocsUrl(repo, path) {
    repo = repo || 'yahoo/fluxible';
    return 'https://github.com/' + repo + '/tree/master' + path;
}

function isLeftClickEvent (e) {
    return e.button === 0;
}

function isModifiedEvent (e) {
    return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

class Doc extends React.Component {

    static contextTypes = {
        executeAction: React.PropTypes.func
    };

    static propTypes = {
        currentDoc: React.PropTypes.object,
        currentRoute: React.PropTypes.object.isRequired
    };

    onClick(e) {
        let target = e.target;

        if ('A' === target.nodeName && '/' === target.getAttribute('href').substr(0, 1)) {
            if (isModifiedEvent(e) || !isLeftClickEvent(e)) {
                return;
            }

            this.context.executeAction(navigateAction, {
                url: target.getAttribute('href')
            });

            e.preventDefault();
        }
    }

    render() {
        let editEl;

        if (!this.props.currentDoc) {
            return (
                <div id="main" role="main" className="D(tbc)--sm Px(10px) Pos(r) Ta(c)">
                    <img src="/public/images/ring.svg" height="60" width="60" className="Mt(25px)" />
                </div>
            );
        }

        if (this.props.currentRoute && this.props.currentRoute.githubPath !== -1) {
            editEl = (
                <I13nAnchor href={createDocsUrl(this.props.currentRoute.githubRepo, this.props.currentRoute.githubPath)}
                    className="edit-github Pos(a) End(10px) T(18px)"
                    target="_blank">
                    Edit on Github
                </I13nAnchor>
            );
        }

        let markup = this.props.currentDoc.content || '';

        return (
            <div id="main" role="main" className="D(tbc)--sm Px(10px) Pos(r)">
                {editEl}
                <I13nDiv key={new Date().getTime()} onClick={this.onClick.bind(this)} dangerouslySetInnerHTML={{__html: markup}} scanLinks={{enable: true}}></I13nDiv>
            </div>
        );
    }
}

export default createI13nNode(Doc, {
    i13nModel: {category: 'doc'}
});
