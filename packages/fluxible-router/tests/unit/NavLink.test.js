/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const { JSDOM } = require('jsdom');
const createMockComponentContext = require('fluxible/utils/createMockComponentContext');
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTestUtils = require('react-dom/test-utils');
const { RouteStore } = require('../../');

const ORIG_NODE_ENV = process.env.NODE_ENV;

let NavLink;
let navigateAction;
let createNavLinkComponent;

let container = null;

const TestRouteStore = RouteStore.withStaticRoutes({
    foo: { path: '/foo', method: 'get' },
    bar: { path: '/bar', method: 'get' },
    int: { path: '/internal', method: 'get' },
    fooA: { path: '/foo/:a', method: 'get' },
    fooAB: { path: '/foo/:a/:b', method: 'get' },
});

const createContext = () => {
    const context = createMockComponentContext({
        stores: [TestRouteStore],
    });

    context.getStore('RouteStore')._handleNavigateStart({
        url: '/foo',
        method: 'GET',
    });

    return context;
};

const wrapWithContext = (context, component) => {
    const MockAppComponent = require('../mocks/MockAppComponent').default;
    return <MockAppComponent context={context}>{component}</MockAppComponent>;
};

const renderComponent = (component, context) => {
    ReactTestUtils.act(() => {
        ReactDOM.render(wrapWithContext(context, component), container);
    });
};

const renderNavLink = (props) => {
    const context = createContext();
    const component = <NavLink id="NavLink" {...props} />;
    renderComponent(component, context);
    const link = document.getElementById('NavLink');
    return { link, context };
};

const simulateClick = (link) => {
    ReactTestUtils.act(() => {
        ReactTestUtils.Simulate.click(link, { button: 0 });
    });
};

function setup(options) {
    if (options?.nodeEnv) {
        process.env.NODE_ENV = options.nodeEnv;
    } else {
        process.env.NODE_ENV = 'test';
    }
    jest.resetModules();

    const jsdom = new JSDOM('<html><body></body></html>', {
        url: 'http://yahoo.com',
    });
    global.document = jsdom.window.document;
    global.window = jsdom.window;
    global.window.scrollTo = (x, y) => ({ x, y });
    global.navigator = jsdom.window.navigator;

    container = document.createElement('div');
    document.body.appendChild(container);

    navigateAction = require('../../').navigateAction;
    NavLink = require('../../').NavLink;
    createNavLinkComponent = require('../../').createNavLinkComponent;
}

function tearDown() {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    container = null;

    delete global.window;
    delete global.document;
    delete global.navigator;

    process.env.NODE_ENV = ORIG_NODE_ENV;
}

describe('NavLink', () => {
    beforeEach(() => {
        setup();
    });

    afterEach(tearDown);

    describe('render()', () => {
        it('should set href correctly', () => {
            const { link } = renderNavLink({ href: '/foo', children: 'bar' });
            expect(link.getAttribute('href')).toBe('/foo');
            expect(link.textContent).toBe('bar');
        });

        it('should prefer href over routeName', () => {
            const { link } = renderNavLink({ routeName: 'fooo', href: '/foo' });
            expect(link.getAttribute('href')).toBe('/foo');
        });

        it('should create href from routeName and parameters', () => {
            const navParams = { a: 1, b: 2 };
            const { link } = renderNavLink({ navParams, routeName: 'fooAB' });
            expect(link.getAttribute('href')).toBe('/foo/1/2');
        });

        it('should have routeName mapped to the correct path', () => {
            const { link } = renderNavLink({ routeName: 'int' });
            expect(link.getAttribute('href')).toBe('/internal');
        });

        it('should create href with query params', () => {
            const queryParams = { a: 1, b: 2 };
            const { link } = renderNavLink({ queryParams, routeName: 'foo' });
            expect(link.getAttribute('href')).toBe('/foo?a=1&b=2');
        });

        it('should set style and className properties', () => {
            const { link } = renderNavLink({
                routeName: 'foo',
                className: 'foo',
                style: { backgroundColor: '#000000' },
            });
            expect(link.getAttribute('class')).toBe('foo');
            expect(link.getAttribute('style')).toEqual(
                'background-color: rgb(0, 0, 0);',
            );
        });

        it('should set active state if href matches current route', () => {
            const { link } = renderNavLink({
                routeName: 'foo',
                activeClass: 'active',
            });
            expect(link.getAttribute('class')).toBe('active');
        });

        it('should set active state by tag name if the optional activeElement property is set', () => {
            const { link } = renderNavLink({
                activeElement: 'span',
                routeName: 'foo',
            });
            expect(link.nodeName.toLowerCase()).toBe('span');
        });

        it('should set active state with custom class and style', () => {
            const { link } = renderNavLink({
                routeName: 'foo',
                activeClass: 'bar',
                activeStyle: { color: 'red' },
            });
            expect(link.getAttribute('class')).toBe('bar');
            expect(link.getAttribute('style').replace(/ /g, '')).toBe(
                'color:red;',
            );
        });

        it('should set the active state and keep the passed props', () => {
            const { link } = renderNavLink({
                routeName: 'foo',
                className: 'bar',
                activeClass: 'active2',
                activeStyle: { color: 'red' },
                style: { background: 'blue' },
            });

            expect(link.getAttribute('class')).toBe('bar active2');
            expect(link.getAttribute('style').replace(/ /g, '')).toBe(
                'background:blue;color:red;',
            );
        });

        it('should not set active state if href does not match current route', () => {
            const navParams = { a: 1, b: 2 };
            const { link } = renderNavLink({
                routeName: 'fooAB',
                navParams,
                activeClass: 'active',
            });
            expect(link.getAttribute('class')).toBeNull();
        });

        it('should able to get additional child props by dynamical getDefaultChildProps function', () => {
            const context = createContext();
            const props = {
                id: 'other-link',
                'data-foo': 'foo',
                'data-bar': 'bar',
            };
            const component = React.createElement(
                createNavLinkComponent({ getDefaultChildProps: () => props }),
                { routeName: 'foo' },
            );

            renderComponent(component, context);

            const link = document.getElementById('other-link');
            expect(link.getAttribute('data-foo')).toBe('foo');
            expect(link.getAttribute('data-bar')).toBe('bar');
        });
    });

    describe('dispatchNavAction()', () => {
        it('use react context', () => {
            const navParams = { a: 1, b: true };
            const { link, context } = renderNavLink({
                href: '/foo',
                preserveScrollPosition: true,
                navParams,
            });

            simulateClick(link);

            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/foo');
            expect(
                context.executeActionCalls[0].payload.preserveScrollPosition,
            ).toBe(true);
            expect(context.executeActionCalls[0].payload.params).toEqual({
                a: 1,
                b: true,
            });
        });

        it('should getNavParams from overwriteSpec if so configured', () => {
            const navParams = { a: 1, b: true };
            const props = {
                id: 'another-link',
                href: '/foo',
                preserveScrollPosition: true,
                navParams,
            };
            const component = React.createElement(
                createNavLinkComponent({
                    getNavParams: () => ({ a: 2, b: false }),
                }),
                props,
            );
            const context = createContext();

            renderComponent(component, context);
            const link = document.getElementById('another-link');

            simulateClick(link);

            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/foo');
            expect(
                context.executeActionCalls[0].payload.preserveScrollPosition,
            ).toBe(true);
            expect(context.executeActionCalls[0].payload.params).toEqual({
                a: 2,
                b: false,
            });
        });

        it('stopPropagation stops event propagation', () => {
            const propagateFail = (e) => {
                expect(e.isPropagationStopped()).toBe(true);
            };
            const navParams = { a: 1, b: true };
            const context = createContext();
            const component = (
                <div onClick={propagateFail}>
                    <NavLink
                        id="link"
                        href="/foo"
                        stopPropagation={true}
                        navParams={navParams}
                    />
                </div>
            );

            renderComponent(component, context);

            const link = document.getElementById('link');
            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(1);
            expect(context.executeActionCalls[0].action).toBe(navigateAction);
        });

        it('context.executeAction called for relative urls', () => {
            const navParams = { a: 1, b: true };
            const { link, context } = renderNavLink({
                href: '/foo',
                navParams,
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(1);
            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/foo');
            expect(context.executeActionCalls[0].payload.params).toEqual({
                a: 1,
                b: true,
            });
        });

        it('context.executeAction called for href when validate is true and href is registered', () => {
            const navParams = { a: 1, b: true };
            const { link, context } = renderNavLink({
                validate: true,
                href: '/internal',
                navParams,
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(1);
            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/internal');
            expect(context.executeActionCalls[0].payload.params).toEqual({
                a: 1,
                b: true,
            });
        });

        it('context.executeAction not called for external href when validate is true', () => {
            const { link, context } = renderNavLink({
                href: '/external',
                validate: true,
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(0);
        });

        it('context.executeAction called for external href when validate is false', () => {
            const { link, context } = renderNavLink({ href: '/external' });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(1);
            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/external');
        });

        it('context.executeAction not called for href when validate is true but href is not registered', () => {
            const { link, context } = renderNavLink({
                validate: true,
                href: 'notregister',
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(0);
        });

        it('context.executeAction called for routeNames', () => {
            const { link, context } = renderNavLink({ routeName: 'foo' });

            link.context = context;
            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(1);
            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/foo');
        });

        it('context.executeAction called for absolute urls from same origin', () => {
            const navParams = { a: 1, b: true };
            const origin = window.location.origin;
            const { link, context } = renderNavLink({
                href: origin + '/foo?x=y',
                navParams,
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(1);
            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/foo?x=y');
            expect(context.executeActionCalls[0].payload.params).toEqual({
                a: 1,
                b: true,
            });
        });

        it('context.executeAction not called for external urls', () => {
            const { link, context } = renderNavLink({
                href: 'http://domain.does.not.exist/foo',
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(0);
        });

        it('context.executeAction not called for external urls when validate is true', () => {
            const { link, context } = renderNavLink({
                validate: true,
                href: 'http://domain.does.not.exist/foo',
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(0);
        });

        it('context.executeAction not called for # urls', () => {
            const { link, context } = renderNavLink({ href: '#here' });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(0);
        });

        it('context.executeAction not called if followLink=true', () => {
            const { link, context } = renderNavLink({
                href: '/foo',
                followLink: true,
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(0);
        });

        it('context.executeAction called if followLink=false', () => {
            const { link, context } = renderNavLink({
                href: '/foo',
                followLink: false,
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(1);
            expect(context.executeActionCalls[0].action).toBe(navigateAction);
            expect(context.executeActionCalls[0].payload.type).toBe('click');
            expect(context.executeActionCalls[0].payload.url).toBe('/foo');
        });

        it('context.executeAction not called if validate=true and route is invalid', () => {
            const { link, context } = renderNavLink({
                href: '/invalid',
                followLink: false,
                validate: true,
            });

            simulateClick(link);

            expect(context.executeActionCalls.length).toBe(0);
        });

        describe('window.onbeforeunload', () => {
            it('should not call context.executeAction when a user does not confirm the onbeforeunload method', () => {
                global.window.confirm = () => false;
                global.window.onbeforeunload = () => 'this is a test';

                const { link, context } = renderNavLink({
                    href: '/foo',
                    followLink: false,
                });

                simulateClick(link);

                expect(context.executeActionCalls.length).toBe(0);
            });

            it('should ignore any error which happens when calling onbeforeunload', () => {
                let loggerWarning;
                global.console.warn = (...args) => {
                    loggerWarning = args;
                };
                global.window.onbeforeunload = () => {
                    throw new Error('Test error');
                };

                const { link, context } = renderNavLink({
                    href: '/foo',
                    followLink: false,
                });

                simulateClick(link);

                expect(loggerWarning[0]).toBe(
                    'Warning: Call of window.onbeforeunload failed',
                );
                expect(loggerWarning[1].message).toBe('Test error');
                expect(context.executeActionCalls.length).toBe(1);
            });
        });

        it('should throw if context not available', () => {
            expect(() => {
                ReactTestUtils.renderIntoDocument(
                    <NavLink href="/foo" followLink={false} />,
                );
            }).toThrowError();
        });

        describe('click type', () => {
            it('navigates on regular click', () => {
                const origin = window.location.origin;
                const { link, context } = renderNavLink({ href: origin });

                simulateClick(link);

                expect(context.executeActionCalls.length).toBe(1);
                expect(context.executeActionCalls[0].action).toBe(
                    navigateAction,
                );
                expect(context.executeActionCalls[0].payload.type).toBe(
                    'click',
                );
            });

            it('navigates on regular click using replaceState', () => {
                const origin = window.location.origin;
                const { link, context } = renderNavLink({
                    href: origin,
                    replaceState: true,
                });

                simulateClick(link);

                expect(context.executeActionCalls[0].action).toBe(
                    navigateAction,
                );
                expect(context.executeActionCalls[0].payload.type).toBe(
                    'replacestate',
                );
            });

            ['metaKey', 'altKey', 'ctrlKey', 'shiftKey'].forEach((key) => {
                it('does not navigate on modified ' + key, () => {
                    const eventData = { button: 0 };
                    eventData[key] = true;
                    const origin = window.location.origin;
                    const { link, context } = renderNavLink({ href: origin });

                    ReactTestUtils.Simulate.click(link, eventData);

                    expect(context.executeActionCalls.length).toBe(0);
                });
            });
        });

        it('allow overriding onClick', () => {
            const onClickMock = jest.fn();
            const { link } = renderNavLink({
                href: '#here',
                onClick: onClickMock,
            });
            simulateClick(link);

            expect(onClickMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('onStoreChange', () => {
        it('should update active state', () => {
            const { link, context } = renderNavLink({
                href: '/foo',
                activeClass: 'active',
                children: 'bar',
            });

            expect(link.getAttribute('href')).toBe('/foo');
            expect(link.textContent).toBe('bar');
            expect(link.getAttribute('class')).toBe('active');

            context.getStore('RouteStore')._handleNavigateStart({
                url: '/bar',
                method: 'GET',
            });

            expect(link.getAttribute('href')).toBe('/foo');
            expect(link.textContent).toBe('bar');
            expect(!link.getAttribute('class')).toBe(true);
        });
    });

    describe('componentDidMount', () => {
        it('should only listen if there is an active property', () => {
            const { context } = renderNavLink({ href: '/foo' });
            const routeStore = context.getStore('RouteStore');

            expect(routeStore.listeners('change').length).toBe(1);
            ReactDOM.unmountComponentAtNode(container);
            expect(routeStore.listeners('change').length).toBe(0);
        });
    });

    describe('componentWillUnmount', () => {
        it('should remove the change listener', () => {
            const { context } = renderNavLink({
                href: '/foo',
                activeClass: 'active',
            });
            const routeStore = context.getStore('RouteStore');

            expect(routeStore.listeners('change').length).toBe(2);
            ReactDOM.unmountComponentAtNode(container);
            expect(routeStore.listeners('change').length).toBe(0);
        });
    });
});

describe('NavLink NODE_ENV === development', () => {
    beforeEach(() => {
        setup({ nodeEnv: 'development' });
    });

    afterEach(tearDown);

    it('should throw if href and routeName undefined', () => {
        const navParams = {};
        expect(() => renderNavLink({ navParams })).toThrowError();
    });
});

describe('NavLink NODE_ENV === production', () => {
    let spy;

    beforeEach(() => {
        spy = jest.spyOn(global.console, 'error');
        setup({ nodeEnv: 'production' });
    });

    afterEach(() => {
        tearDown();
        spy.mockRestore();
    });

    it('should render link with missing href with console error', () => {
        const { link } = renderNavLink({ children: 'bar' });
        expect(link.getAttribute('href')).toBe(null);
        expect(link.textContent).toBe('bar');
        expect(spy).toHaveBeenCalledWith(
            'Error: Render NavLink with empty or missing href',
            expect.anything(),
        );
    });

    it('should render link with empty href with console error', () => {
        const { link } = renderNavLink({ href: '', children: 'bar' });
        expect(link.getAttribute('href')).toBe('');
        expect(link.textContent).toBe('bar');
        expect(spy).toHaveBeenCalledWith(
            'Error: Render NavLink with empty or missing href',
            expect.anything(),
        );
    });
});
