/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global document */

import debugLib from 'debug';
import React from 'react';
import Home from './Home';
import Docs from './Docs';
import { provideContext, connectToStores } from 'fluxible-addons-react';
import { handleHistory } from 'fluxible-router';
import Debug from './Debug';
import { NavLink } from 'fluxible-router';
import TopNav from './TopNav';
import Status404 from './Status404';
import Status500 from './Status500';
import cx from 'classnames';

const debug = debugLib('MyApp');

class Application extends React.Component {
    componentDidUpdate(prevProps, prevState) {
        document.title = this.props.currentTitle;
    }

    render() {
        debug('rendering', this.props);

        var Handler =
            this.props.currentRoute && this.props.currentRoute.handler;
        var routeName = this.props.currentRoute && this.props.currentRoute.name;
        var hideLogo = routeName === 'home';
        var logoClasses = cx({
            'V(h)': hideLogo,
            'Va(m) Fz(20px) Lh(1.2) C(#fff) Td(n):h': true,
        });

        if (Handler) {
            if (this.props.currentNavigateError) {
                Handler = <Status500 />;
            } else {
                Handler = <Handler currentDoc={this.props.currentDoc} />;
            }
        } else {
            Handler = <Status404 />;
        }

        return (
            <div className="H(100%)">
                <Debug />
                <div className="wrapper Bxz(bb) Mih(100%)">
                    <div
                        id="header"
                        role="header"
                        className="Px(10px) Py(13px) Ov(h) Z(7) Pos(r) Bgc(logo) optLegibility"
                    >
                        <div className="innerwrapper spaceBetween Mx(a)--sm W(90%)--sm">
                            <NavLink
                                className={logoClasses}
                                routeName="home"
                                style={{ fontFamily: 'Montserrat' }}
                            >
                                <img
                                    src="/public/images/logo_small.svg"
                                    width="16"
                                    height="16"
                                    alt="Fluxible"
                                    style={{ verticalAlign: 'baseline' }}
                                />{' '}
                                Fluxible
                            </NavLink>{' '}
                            <TopNav
                                selected={routeName}
                                currentRoute={this.props.currentRoute}
                            />
                        </div>
                    </div>
                    {Handler}
                </div>
                <div id="footer" className="P(20px) Bdt(1)" role="footer">
                    <div className="innerwrapper spaceBetween Mx(a)--sm W(90%)--sm W(a)--sm">
                        <small>
                            All code on this site is licensed under the{' '}
                            <a href="https://github.com/yahoo/fluxible.io/blob/master/LICENSE.md">
                                Yahoo BSD License
                            </a>
                            , unless otherwise stated.
                        </small>{' '}
                        <small>
                            &copy; 2015-present Yahoo! Inc. All rights reserved.
                        </small>
                    </div>
                </div>
            </div>
        );
    }
}

Application = provideContext(
    handleHistory(
        connectToStores(Application, ['DocStore'], (context) => ({
            currentTitle: context.getStore('DocStore').getCurrentTitle() || '',
            currentDoc: context.getStore('DocStore').getCurrent(),
        })),
    ),
    ['query', 'devtools'],
);

export default Application;
