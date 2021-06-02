/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint react/no-find-dom-node:0 */

import { JSDOM } from 'jsdom';
import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import resolve from 'resolve';
import createMockComponentContext from 'fluxible/utils/createMockComponentContext';
import { navigateAction, RouteStore } from '../../../';

const ORIG_NODE_ENV = process.env.NODE_ENV;

let React;
let ReactDOM;
let NavLink;
let createNavLinkComponent;
let ReactTestUtils;
let MockAppComponent;

const TestRouteStore = RouteStore.withStaticRoutes({
    foo: { path: '/foo', method: 'get' },
    bar: { path: '/bar', method: 'get'},
    int: { path: '/internal', method: 'get'},
    fooA: { path: '/foo/:a', method: 'get' },
    fooAB: { path: '/foo/:a/:b', method: 'get' }
});

function setup(options, done) {
    if (options.nodeEnv) {
        process.env.NODE_ENV = options.nodeEnv;
    }
    let path = fs.realpathSync(resolve.sync('../../../dist/lib/createNavLinkComponent'));
    delete require.cache[path];
    path = fs.realpathSync(resolve.sync('../../../dist/lib/NavLink'));
    delete require.cache[path];

    const jsdom = new JSDOM('<html><body></body></html>', { url: 'http://yahoo.com' });
    global.document = jsdom.window.document;
    global.window = jsdom.window;
    global.window.scrollTo = (x, y) => ({ x, y });
    global.navigator = jsdom.window.navigator;

    React = require('react');
    ReactDOM = require('react-dom');
    ReactTestUtils = require('react-dom/test-utils');
    const mockContext = createMockComponentContext({
        stores: [TestRouteStore]
    });
    mockContext.getStore('RouteStore')._handleNavigateStart({
        url: '/foo',
        method: 'GET'
    });
    MockAppComponent = require('../../mocks/MockAppComponent')['default'];
    NavLink = require('../../../dist/lib/NavLink');
    createNavLinkComponent = require('../../../dist/lib/createNavLinkComponent');

    return done(null, mockContext);
}

function tearDown() {
    delete global.window;
    delete global.document;
    delete global.navigator;
    process.env.NODE_ENV = ORIG_NODE_ENV;
}

describe('NavLink', () => {
    let mockContext;

    beforeEach((done) => {
        setup({}, (err, context) => {
            mockContext = context;
            done(err);
        });
    });

    afterEach(tearDown);

    describe('render()', () => {
        it('should set href correctly', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href="/foo">
                        bar
                    </NavLink>
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('href')).to.equal('/foo');
            expect(ReactDOM.findDOMNode(link).textContent).to.equal('bar');
        });

        it('should prefer href over routeName', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName="fooo" href="/foo" />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('href')).to.equal('/foo');
        });

        it('should create href from routeName and parameters', () => {
            const navParams = {a: 1, b: 2};
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='fooAB' navParams={navParams} />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('href')).to.equal('/foo/1/2');
        });

        it('should have routeName mapped to the correct path', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='int' />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('href')).to.equal('/internal');
        });

        it('should create href with query params', () => {
            const queryParams = {a: 1, b: 2};
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='foo' queryParams={queryParams} />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('href')).to.equal('/foo?a=1&b=2');
        });

        it('should set style and className properties', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='foo' className='foo' style={{
                        backgroundColor: '#000000'
                    }} />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('class')).to.equal('foo');
            expect(ReactDOM.findDOMNode(link).getAttribute('style')).to.contain('background-color');
        });

        it('should set active state if href matches current route', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='foo' activeClass='active' />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('class')).to.equal('active');
        });

        it('should set active state by tag name if the optional activeElement property is set', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink activeElement="span" routeName='foo' />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).nodeName.toLowerCase()).to.equal('span');
        });

        it('should set active state with custom class and style', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='foo' activeClass="bar" activeStyle={{color: 'red'}} />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('class')).to.equal('bar');
            expect(ReactDOM.findDOMNode(link).getAttribute('style').replace(/ /g, '')).to.equal('color:red;');
        });

        it('should set the active state and keep the passed props', () => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='foo' className='bar' activeClass="active2"
                        activeStyle={{color: 'red'}} style={{background: 'blue'}} />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('class')).to.equal('bar active2');
            expect(ReactDOM.findDOMNode(link).getAttribute('style').replace(/ /g, '')).to.equal('background:blue;color:red;');
        });

        it('should not set active state if href does not match current route', () => {
            const navParams = {a: 1, b: 2};
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='fooAB' navParams={navParams} activeClass='active' />
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('class')).to.equal(null);
        });

        it('should able to get additional child props by dynamical getDefaultChildProps function', () => {
            const navLink = React.createElement(createNavLinkComponent({
                getDefaultChildProps: () => {
                    return {'data-foo': 'foo', 'data-bar': 'bar'};
                }
            }), {routeName: 'foo'});
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    {navLink}
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('data-foo')).to.equal('foo');
            expect(ReactDOM.findDOMNode(link).getAttribute('data-bar')).to.equal('bar');
        });
    });

    describe('dispatchNavAction()', () => {
        it('use react context', (done) => {
            const navParams = {a: 1, b: true};
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/foo' preserveScrollPosition={true} navParams={navParams} />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/foo');
                expect(mockContext.executeActionCalls[0].payload.preserveScrollPosition).to.equal(true);
                expect(mockContext.executeActionCalls[0].payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });
        it('should getNavParams from overwriteSpec if so configured', (done) => {
            const navParams = {a: 1, b: true};
            const params = {
                href:'/foo',
                preserveScrollPosition:true,
                navParams: navParams
            };
            const navLink = React.createElement(createNavLinkComponent({
                getNavParams: () => {
                    return {a: 2, b: false};
                }
            }), params);
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    {navLink}
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/foo');
                expect(mockContext.executeActionCalls[0].payload.preserveScrollPosition).to.equal(true);
                expect(mockContext.executeActionCalls[0].payload.params).to.eql({a: 2, b: false});
                done();
            }, 10);
        });
        it('stopPropagation stops event propagation', (done) => {
            const propagateFail = (e) => {
                expect(e.isPropagationStopped()).to.eql(true);
            };
            const navParams = {a: 1, b: true};
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext} onClick={propagateFail}>
                    <NavLink href='/foo' stopPropagation={true} navParams={navParams} />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                done();
            }, 10);
        });

        it('context.executeAction called for relative urls', (done) => {
            const navParams = {a: 1, b: true};
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/foo' navParams={navParams} />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/foo');
                expect(mockContext.executeActionCalls[0].payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });

        it('context.executeAction called for href when validate is true and href is registered', (done) => {
            const navParams = {a: 1, b: true};
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink validate={true} href='/internal' navParams={navParams}/>
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/internal');
                expect(mockContext.executeActionCalls[0].payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });

        it('context.executeAction not called for external href when validate is true', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/external' validate={true}/>
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(0);
                done();
            }, 10);
        });

        it('context.executeAction called for external href when validate is false', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/external'/>
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/external');
                done();
            }, 10);
        });

        it('context.executeAction not called for href when validate is true but href is not registered', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink validate={true} href='notregister'/>
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(0);
                done();
            }, 10);
        });

        it('context.executeAction called for routeNames', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink routeName='foo' />
                </MockAppComponent>
            );
            link.context = mockContext;
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/foo');
                done();
            }, 10);
        });

        it('context.executeAction called for absolute urls from same origin', (done) => {
            const navParams = {a: 1, b: true};
            const origin = window.location.origin;
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href={origin + '/foo?x=y'} navParams={navParams} />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/foo?x=y');
                expect(mockContext.executeActionCalls[0].payload.params).to.eql({a: 1, b: true});
                done();
            }, 10);
        });

        it('context.executeAction not called for external urls', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='http://domain.does.not.exist/foo' />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(0);
                done();
            }, 10);
        });

        it('context.executeAction not called for external urls when validate is true', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink validate={true} href='http://domain.does.not.exist/foo' />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(0);
                done();
            }, 10);
        });

        it('context.executeAction not called for # urls', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='#here' />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(0);
                done();
            }, 10);
        });

        it('context.executeAction not called if followLink=true', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/foo' followLink={true} />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(0);
                done();
            }, 10);
        });

        it('context.executeAction called if followLink=false', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/foo' followLink={false} />
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(1);
                expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                expect(mockContext.executeActionCalls[0].payload.url).to.equal('/foo');
                done();
            }, 10);
        });

        it('context.executeAction not called if validate=true and route is invalid', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/invalid' followLink={false} validate={true}/>
                </MockAppComponent>
            );
            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
            window.setTimeout(() => {
                expect(mockContext.executeActionCalls.length).to.equal(0);
                done();
            }, 10);
        });

        describe('window.onbeforeunload', () => {
            it('should not call context.executeAction when a user does not confirm the onbeforeunload method', (done) => {
                global.window.confirm = () => false;
                global.window.onbeforeunload = () => 'this is a test';

                const link = ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext}>
                        <NavLink href='/foo' followLink={false} />
                    </MockAppComponent>
                );
                ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
                window.setTimeout(() => {
                    expect(mockContext.executeActionCalls.length).to.equal(0);
                    done();
                }, 10);
            });

            it('should ignore any error which happens when calling onbeforeunload', (done) => {
                let loggerWarning;
                global.console.warn = (...args) => {
                    loggerWarning = args;
                };
                global.window.onbeforeunload = () => {
                    throw new Error('Test error');
                };

                const link = ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext}>
                        <NavLink href='/foo' followLink={false} />
                    </MockAppComponent>
                );
                ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
                window.setTimeout(() => {
                    expect(loggerWarning[0]).to.equal('Warning: Call of window.onbeforeunload failed');
                    expect(loggerWarning[1].message).to.equal('Test error');
                    expect(mockContext.executeActionCalls.length).to.equal(1);
                    done();
                }, 10);
            });
        });

        it('should throw if context not available', () => {
            expect(() => {
                ReactTestUtils.renderIntoDocument(
                    <NavLink href="/foo" followLink={false} />
                );
            }).to['throw']();
        });

        describe('click type', () => {
            it('navigates on regular click', (done) => {
                const origin = window.location.origin;
                const link = ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext}>
                        <NavLink href={origin} />
                    </MockAppComponent>
                );
                ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
                window.setTimeout(() => {
                    expect(mockContext.executeActionCalls.length).to.equal(1);
                    expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                    expect(mockContext.executeActionCalls[0].payload.type).to.equal('click');
                    done();
                }, 10);
            });

            it('navigates on regular click using replaceState', (done) => {
                const origin = window.location.origin;
                const link = ReactTestUtils.renderIntoDocument(
                    <MockAppComponent context={mockContext}>
                        <NavLink href={origin} replaceState={true} />
                    </MockAppComponent>
                );
                ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});
                window.setTimeout(() => {
                    expect(mockContext.executeActionCalls[0].action).to.equal(navigateAction);
                    expect(mockContext.executeActionCalls[0].payload.type).to.equal('replacestate');
                    done();
                }, 10);
            });

            ['metaKey', 'altKey', 'ctrlKey', 'shiftKey'].forEach((key) => {
                it('does not navigate on modified ' + key, (done) => {
                    const eventData = {button: 0};
                    eventData[key] = true;
                    const origin = window.location.origin;
                    const link = ReactTestUtils.renderIntoDocument(
                        <MockAppComponent context={mockContext}>
                            <NavLink href={origin} />
                        </MockAppComponent>
                    );
                    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), eventData);
                    window.setTimeout(() => {
                        expect(mockContext.executeActionCalls.length).to.equal(0);
                        done();
                    }, 10);
                });
            });
        });

        it('allow overriding onClick', (done) => {
            const onClickMock = sinon.spy();
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='#here' onClick={onClickMock} />
                </MockAppComponent>
            );

            ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(link), {button: 0});

            window.setTimeout(() => {
                expect(onClickMock.calledOnce).to.equal(true);
                done();
            }, 10);
        });
    });

    describe('onStoreChange', () => {
        it('should update active state', (done) => {
            const link = ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/foo' activeClass='active'>
                        bar
                    </NavLink>
                </MockAppComponent>
            );
            expect(ReactDOM.findDOMNode(link).getAttribute('href')).to.equal('/foo');
            expect(ReactDOM.findDOMNode(link).textContent).to.equal('bar');
            expect(ReactDOM.findDOMNode(link).getAttribute('class')).to.equal('active');
            mockContext.getStore('RouteStore')._handleNavigateStart({
                url: '/bar',
                method: 'GET'
            });
            // Wait for DOM to update
            setTimeout(() => {
                expect(ReactDOM.findDOMNode(link).getAttribute('href')).to.equal('/foo');
                expect(ReactDOM.findDOMNode(link).textContent).to.equal('bar');
                expect(!ReactDOM.findDOMNode(link).getAttribute('class')).to.equal(true);
                done();
            }, 50);
        });
    });

    describe('componentDidMount', () => {
        it('should only listen if there is an active property', () => {
            const div = document.createElement('div');
            ReactDOM.render(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/foo' />
                </MockAppComponent>
                , div);
            const routeStore = mockContext.getStore('RouteStore');
            expect(routeStore.listeners('change').length).to.equal(1);
            ReactDOM.unmountComponentAtNode(div);
            expect(routeStore.listeners('change').length).to.equal(0);
        });
    });

    describe('componentWillUnmount', () => {
        it('should remove the change listener', () => {
            const div = document.createElement('div');
            ReactDOM.render(
                <MockAppComponent context={mockContext}>
                    <NavLink href='/foo' activeClass='active' />
                </MockAppComponent>
                , div);
            const routeStore = mockContext.getStore('RouteStore');
            expect(routeStore.listeners('change').length).to.equal(2);
            ReactDOM.unmountComponentAtNode(div);
            expect(routeStore.listeners('change').length).to.equal(0);
        });
    });
});

describe('NavLink NODE_ENV === development', () => {
    let mockContext;

    beforeEach((done) => {
        setup({nodeEnv: 'development'}, (err, context) => {
            mockContext = context;
            done(err);
        });
    });

    afterEach(tearDown);

    it('should throw if href and routeName undefined', () => {
        const navParams = {};
        expect(() => {
            ReactTestUtils.renderIntoDocument(
                <MockAppComponent context={mockContext}>
                    <NavLink navParams={navParams} />
                </MockAppComponent>
            );
        }).to['throw']();
    });
});

describe('NavLink NODE_ENV === production', () => {
    let mockContext;
    let loggerError;

    beforeEach((done) => {
        global.console.error = (...args) => {
            loggerError = args;
        };

        setup({nodeEnv: 'production'}, (err, context) => {
            mockContext = context;
            done(err);
        });
    });

    afterEach(tearDown);

    it('should render link with missing href with console error', () => {
        const link = ReactTestUtils.renderIntoDocument(
            <MockAppComponent context={mockContext}>
                <NavLink>
                    bar
                </NavLink>
            </MockAppComponent>
        );
        const linkNode = ReactDOM.findDOMNode(link);
        expect(linkNode.getAttribute('href')).to.equal(null, linkNode.outerHTML);
        expect(linkNode.textContent).to.equal('bar', linkNode.outerHTML);
        expect(loggerError[0]).to.contain('Error: Render NavLink with empty or missing href');
    });

    it('should render link with empty href with console error', () => {
        const link = ReactTestUtils.renderIntoDocument(
            <MockAppComponent context={mockContext}>
                <NavLink href=''>
                    bar
                </NavLink>
            </MockAppComponent>
        );
        const linkNode = ReactDOM.findDOMNode(link);
        expect(linkNode.getAttribute('href')).to.equal('', linkNode.outerHTML);
        expect(linkNode.textContent).to.equal('bar', linkNode.outerHTML);
        expect(loggerError[0]).to.contain('Error: Render NavLink with empty or missing href');
    });
});
