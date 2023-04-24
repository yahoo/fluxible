/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import { NavLink } from 'fluxible-router';
import Doc from './Doc';

class Home extends React.Component {
    render() {
        return (
            <div className="home-page">
                <div id="splash" className="D(tb) W(100%) Bdb(1) Pos(r)">
                    <div className="Ta(c) Va(m) Bgz(cv) Ov(h) Pos(r) W(100%) Start(0) Pb(30px) Bg(splash)">
                        <h1
                            className="Mx(a) W(50%) Pos(r) Ov(h) C(#fff) Fw(300) Tsh(1) Fz(450%)"
                            style={{ fontFamily: 'Montserrat' }}
                        >
                            <img
                                src="/public/images/logo_small.svg"
                                width="60"
                                height="60"
                                alt="Fluxible"
                                style={{ verticalAlign: 'inherit' }}
                            />{' '}
                            Fluxible
                        </h1>
                        <p className="Mt(0) C(#fff) Tsh(1) Fz(120%)">
                            Build isomorphic Flux applications
                        </p>
                        <p>
                            <NavLink
                                className="D(ib) Mb(10px) Px(20px) Py(10px) C(#fff) Bdrs(5px) Td(n):h Bg(t) Fw(b) Bd(2)"
                                routeName="quickStart"
                            >
                                Get Started
                            </NavLink>
                        </p>
                    </div>
                    <div className="Pos(a) End(10px) B(5px) C(eee) Fz(80%)">
                        <cite>
                            <a
                                href="https://www.flickr.com/photos/devinmoore/2670474853"
                                title="Splash derived from Blue Ring Electricity Fractal by Devin Moore used under CC BY 2.0"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                &copy; Devon Moore
                            </a>
                        </cite>
                    </div>
                </div>

                <div className="innerwrapper Bxz(bb) Pt(20px) Px(10px) Mb-20px Mx(a)--sm W(90%)--sm W(a)">
                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pend(20px)--sm W(50%)--sm">
                        <h2>Singleton-free for server rendering</h2>
                        <p>
                            <NavLink routeName="stores">Stores</NavLink> are
                            classes that are instantiated per request or client
                            session. This ensures that the stores are isolated
                            and do not bleed information between requests.
                        </p>
                    </div>

                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pstart(20px)--sm W(50%)--sm">
                        <h2>Dehydration/Rehydration</h2>
                        <p>
                            <NavLink routeName="stores">Stores</NavLink> can
                            provide `dehydrate` and `rehydrate` methods so that
                            you can propagate the initial server state to the
                            client.
                        </p>
                    </div>

                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pend(20px)--sm W(50%)--sm Bdt(1)--sm Mt(2em)--sm">
                        <h2>Stateless async actions</h2>
                        <p>
                            <NavLink routeName="actions">Actions</NavLink> are
                            stateless functions that can handle promises or
                            callbacks.
                        </p>
                    </div>

                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pstart(20px)--sm W(50%)--sm Bdt(1)--sm Mt(2em)--sm">
                        <h2>Higher order components</h2>
                        <p>
                            Intuitive way to access state from stores or set
                            component child context.
                        </p>
                    </div>

                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pend(20px)--sm W(50%)--sm Bdt(1)--sm Mt(2em)--sm">
                        <h2>React Integration</h2>
                        <p>
                            Helper utilities for integrating your Fluxible app
                            into React{' '}
                            <NavLink routeName="components">Components</NavLink>{' '}
                            with less boilerplate.
                        </p>
                    </div>

                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pstart(20px)--sm W(50%)--sm Bdt(1)--sm Mt(2em)--sm">
                        <h2>Flow Regulation</h2>
                        <p>
                            <NavLink routeName="fluxibleContext">
                                FluxibleContext
                            </NavLink>{' '}
                            restricts access to your Flux methods so that you
                            can't break out of the unidirectional flow.
                        </p>
                    </div>

                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pend(20px)--sm W(50%)--sm Bdt(1)--sm Mt(2em)--sm">
                        <h2>Pluggable</h2>
                        <p>
                            Want to add your own interfaces to the Flux flow?{' '}
                            <NavLink routeName="plugins">Plugins</NavLink> allow
                            you to add methods to any of the contexts.
                        </p>
                    </div>

                    <div className="Bxz(bb) D(ib) Va(t) W(100%) Pstart(20px)--sm W(50%)--sm Bdt(1)--sm Mt(2em)--sm">
                        <h2>Updated with Latest React</h2>
                        <p>
                            Updated to follow the latest React changes and best
                            practices.
                        </p>
                    </div>

                    <p className="Ta(c) Mt(2em)--sm">
                        <a href="https://gitter.im/yahoo/fluxible">
                            <img
                                src="https://camo.githubusercontent.com/20d7543bc8280bf8134b686c46c7b7e2c0a467fd/68747470733a2f2f6261646765732e6769747465722e696d2f67697474657248512f6769747465722e706e67"
                                alt="Gitter chat"
                                data-canonical-src="https://badges.gitter.im/gitterHQ/gitter.png"
                                style={{ maxWidth: '100%' }}
                                className="Va(m)"
                            />
                        </a>
                    </p>

                    <div className="Ta(c)">
                        <NavLink
                            className="D(ib) My(20px) Px(20px) Py(10px) C(#fff) Bgc(logo) Bdrs(5px) Td(n):h"
                            routeName="quickStart"
                        >
                            Get Started
                        </NavLink>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
