/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { provideContext } from 'fluxible-addons-react';
import handleHistory from '../../dist/handleHistory';

class MockAppComponent extends React.Component {
    render() {
        if (!this.props.children) {
            return null;
        }
        return React.cloneElement(this.props.children, {
            currentRoute: this.props.currentRoute,
        });
    }
}

MockAppComponent.propTypes = {
    children: PropTypes.object,
    currentRoute: PropTypes.object,
};

export default provideContext(
    handleHistory(MockAppComponent, {
        checkRouteOnPageLoad: false,
        enableScroll: true,
    })
);

export function createWrappedMockAppComponent(opts) {
    return provideContext(handleHistory(MockAppComponent, opts));
}
