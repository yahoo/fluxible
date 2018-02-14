/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import { NavLink } from 'fluxible-router';

class Status500 extends React.Component {
    render() {
        return (
            <div id="500" className="D(tb) W(100%) Pos(r)">
                <div className="D(tb)c Va(m) Bgz(cv) Ov(h) Pos(r) W(100%) Start(0)">
                    <div className="Mx(a) W(65%) Pos(r) Ov(h) Fw(300)">
                        <h1>Error</h1>
                        <p>Sorry there was an unexpected errror.</p>
                        <p><NavLink routeName="home">Back to the home page.</NavLink></p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Status500;
