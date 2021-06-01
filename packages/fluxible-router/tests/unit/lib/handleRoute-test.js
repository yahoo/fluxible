/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
import React from 'react';
import { expect } from 'chai';
import TestRenderer from 'react-test-renderer';
import createMockComponentContext from 'fluxible/utils/createMockComponentContext';
import { provideContext } from 'fluxible-addons-react';
import { handleRoute, RouteStore } from '../../../';

const DumbComponent = () => null;

const TestRouteStore = RouteStore.withStaticRoutes({});

describe('handleRoute', () => {
    it('pass correct props to children', () => {
        const context = createMockComponentContext({
            stores: [TestRouteStore],
        });

        const props = { foo: 42, context };
        const WrappedComponent = provideContext(handleRoute(DumbComponent));
        const renderer = TestRenderer.create(<WrappedComponent {...props} />);
        const component = renderer.root.findByType(DumbComponent);

        expect(component.props.foo).to.equal(42);
        expect(component.props.context).to.deep.equal(context);
        expect(component.props.currentNavigate).to.equal(null);
        expect(component.props.currentNavigateError).to.equal(null);
        expect(component.props.currentRoute).to.equal(null);
        expect(component.props.isNavigateComplete).to.equal(null);

        expect(component.props.isActive).to.be.a('function');
        expect(component.props.makePath).to.be.a('function');
    });
});
