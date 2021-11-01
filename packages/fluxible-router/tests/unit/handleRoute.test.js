/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const React = require('react');
const TestRenderer = require('react-test-renderer');
const createMockComponentContext = require('fluxible/utils/createMockComponentContext');
const { provideContext } = require('fluxible-addons-react');
const { handleRoute, RouteStore } = require('../../');

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

        expect(component.props.foo).toBe(42);
        expect(component.props.context).toEqual(context);
        expect(component.props.currentNavigate).toBeNull();
        expect(component.props.currentNavigateError).toBeNull();
        expect(component.props.currentRoute).toBeNull();
        expect(component.props.isNavigateComplete).toBeNull();

        expect(component.props.isActive).toBeInstanceOf(Function);
        expect(component.props.makePath).toBeInstanceOf(Function);
    });
});
