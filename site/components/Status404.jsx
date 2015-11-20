/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import NavLink from './NavLink.jsx';

class Status404 extends React.Component {
    render() {
        return (
            <div id="404" className="D(tb) W(100%) Pos(r)">
                <div className="D(tb)c Va(m) Bgz(cv) Ov(h) Pos(r) W(100%) Start(0)">
                    <div className="Mx(a) W(65%) Pos(r) Ov(h) Fw(300)">
                        <h1>Not found</h1>
                        <p>Sorry we could not find that resource.</p>
                        <p><NavLink routeName="home" i13nModel={{category: '404'}}>Back to the home page.</NavLink></p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Status404;
