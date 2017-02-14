/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';
var React = require('react');
var debug = require('debug')('FluxibleRouter:handleHistory');
var handleRoute = require('../lib/handleRoute');
var navigateAction = require('../lib/navigateAction');
var History = require('./History');
var TYPE_CLICK = 'click';
var TYPE_PAGELOAD = 'pageload';
var TYPE_REPLACESTATE = 'replacestate';
var TYPE_POPSTATE = 'popstate';
var TYPE_DEFAULT = 'default'; // default value if navigation type is missing, for programmatic navigation
var hoistNonReactStatics = require('hoist-non-react-statics');
var inherits = require('inherits');

var defaultOptions = {
    checkRouteOnPageLoad: false,
    enableScroll: true,
    saveScrollInState: true,
    historyCreator: function () {
        return new History();
    },
    ignorePopstateOnPageLoad: false
};

// Begin listening for popstate so they are not missed prior to instantiation
// this could be if the user uses back button multiple times before
// handleHistory componentDidMount fires
var EVENT_POPSTATE = 'popstate';
var HAS_PUSH_STATE = !!(typeof window !== 'undefined' && window.history && window.history.pushState);
var lastPendingPopstateEvent = null;
function preloadListener() {
    lastPendingPopstateEvent = arguments;
}
if (HAS_PUSH_STATE) {
    window.addEventListener(EVENT_POPSTATE, preloadListener);
}

// Used for ensuring that only one history handler is created
var historyCreated = false;

function createComponent(Component, opts) {
    var options = Object.assign({}, defaultOptions, opts);

    function shouldIgnorePopstateOnPageLoad() {
        var ignore = options.ignorePopstateOnPageLoad;
        if ('function' === typeof ignore) {
            return ignore();
        }
        return !!ignore;
    }

    function HistoryHandler(props, context) {
        React.Component.apply(this, arguments);
    }

    inherits(HistoryHandler, React.Component);

    HistoryHandler.displayName = 'HistoryHandler';
    HistoryHandler.contextTypes = {
        executeAction: React.PropTypes.func.isRequired
    };
    HistoryHandler.propTypes = {
        currentRoute: React.PropTypes.object,
        currentNavigate: React.PropTypes.object
    };
    HistoryHandler.defaultProps = {
        currentRoute: null,
        currentNavigate: null
    };

    Object.assign(HistoryHandler.prototype, {

        componentDidMount: function () {
            if (historyCreated) {
                throw new Error('Only one history handler should be on the ' +
                'page at a time.');
            }

            // Bind the event listeners
            this._onHistoryChange = this.constructor.prototype._onHistoryChange.bind(this);
            this._onScroll = this.constructor.prototype._onScroll.bind(this);
            this._saveScrollPosition = this.constructor.prototype._saveScrollPosition.bind(this);

            this._history = options.historyCreator();

            this._ignorePageLoadPopstate = shouldIgnorePopstateOnPageLoad();
            if (this._ignorePageLoadPopstate) {
                // populate the state object, so that all pages loaded will have a non-null
                // history.state object, which we can use later to distinguish pageload popstate
                // event from regular popstate events
                var historyState = this._history.getState();
                if (!historyState) {
                    this._history.replaceState({});
                }
            }

            this._scrollTimer = null;

            if (options.checkRouteOnPageLoad) {
                // You probably want to enable checkRouteOnPageLoad, if you use a history implementation
                // that supports hash route:
                //   At page load, for browsers without pushState AND hash is present in the url,
                //   since hash fragment is not sent to the server side, we need to
                //   dispatch navigate action on browser side to load the actual page content
                //   for the route represented by the hash fragment.

                var urlFromHistory = this._history.getUrl();
                var urlFromState = this.props.currentRoute && this.props.currentRoute.url;

                if ((urlFromHistory !== urlFromState)) {
                    debug('pageload navigate to actual route', urlFromHistory, urlFromState);
                    this.context.executeAction(navigateAction, {
                        type: TYPE_PAGELOAD,
                        url: urlFromHistory
                    });
                }
            }
            this._history.on(this._onHistoryChange);

            if (HAS_PUSH_STATE) {
                // We're ready to start handling the last popstate that fired
                // before the history handler was mounted.
                window.removeEventListener(EVENT_POPSTATE, preloadListener);
                if (lastPendingPopstateEvent) {
                    this._onHistoryChange.apply(this, lastPendingPopstateEvent);
                    lastPendingPopstateEvent = null;
                }
            }

            if (options.saveScrollInState) {
                window.addEventListener('scroll', this._onScroll);
            }
        },
        _onScroll: function (e) {
            if (this._scrollTimer) {
                window.clearTimeout(this._scrollTimer);
            }
            this._scrollTimer = window.setTimeout(this._saveScrollPosition, 150);
        },
        _onHistoryChange: function (e) {
            debug('history listener invoked', e);
            if (this._ignorePageLoadPopstate) {
                // 1) e.state (null) and history.state (not null)
                //    -- this is popstate triggered on pageload in Safari browser.
                //       history.state is not null, because if _ignorePageLoadPopstate
                //       is true, we replaceState in componentDidMount() to set state obj
                // 2) e.state(not null) and history.state (not null)
                //    -- regular popstate triggered by forward/back button click and history.go(n)
                // 3) history.state (null)
                //    -- this is not a valid scenario, as we update the state before
                //       _onHistoryChange gets invoked in componentDidMount()
                var stateFromHistory = this._history.getState();
                var isPageloadPopstate = (e.state === null) && !!stateFromHistory;
                debug('history listener detecting pageload popstate', e.state, stateFromHistory);
                if (isPageloadPopstate) {
                    debug('history listener skipped pageload popstate');
                    return;
                }
            }
            var props = this.props;
            var url = this._history.getUrl();
            var currentRoute = props.currentRoute || {};
            var nav = props.currentNavigate || {};

            var currentUrl = currentRoute.url;

            var onBeforeUnloadText = typeof window.onbeforeunload === 'function' ? window.onbeforeunload() : '';
            var confirmResult = onBeforeUnloadText ? window.confirm(onBeforeUnloadText) : true;

            var navParams = nav.params || {};
            var historyState = {
                params: navParams
            };

            if (options.saveScrollInState) {
                historyState.scroll = {
                    x: window.scrollX || window.pageXOffset,
                    y: window.scrollY || window.pageYOffset
                };
            }

            var pageTitle = navParams.pageTitle || null;

            debug('history listener url, currentUrl:', url, currentUrl, this.props);

            if (!confirmResult) {
                // Pushes the previous history state back on top to set the correct url
                this._history.pushState(historyState, pageTitle, currentUrl);
            } else {
                if (url !== currentUrl) {
                    // Removes the window.onbeforeunload method so that the next page will not be affected
                    window.onbeforeunload = null;

                    this.context.executeAction(navigateAction, {
                        type: TYPE_POPSTATE,
                        url: url,
                        params: (e.state && e.state.params)
                    });
                }
            }

        },
        _saveScrollPosition: function (e) {
            var historyState = (this._history.getState && this._history.getState()) || {};
            var scrollX = window.scrollX || window.pageXOffset;
            var scrollY = window.scrollY || window.pageYOffset;
            // reduce unused replaceState
            // also prevent IOS Safari reset scroll position to 0 with universal link bar showing
            if (historyState.scroll && historyState.scroll.x === scrollX && historyState.scroll.y === scrollY) {
                debug('skip updating scrolling position with same position', historyState.scroll);
                return;
            }
            historyState.scroll = {
                x: scrollX,
                y: scrollY
            };
            debug('remember scroll position', historyState.scroll);
            this._history.replaceState(historyState);
        },
        componentWillUnmount: function () {
            this._history.off(this._onHistoryChange);

            if (options.saveScrollInState) {
                window.removeEventListener('scroll', this._onScroll);
            }

            historyCreated = false;
        },
        componentDidUpdate: function (prevProps, prevState) {
            debug('component did update', prevState, this.props);

            var nav = this.props.currentNavigate || {};
            var navType = nav.type || TYPE_DEFAULT;
            var navParams = nav.params || {};
            var historyState;

            switch (navType) {
                case TYPE_CLICK:
                case TYPE_DEFAULT:
                case TYPE_REPLACESTATE:
                    if (nav.url === this._history.getUrl()) {
                        return;
                    }
                    historyState = {params: navParams};
                    if (nav.preserveScrollPosition) {
                        if (options.saveScrollInState) {
                            historyState.scroll = {
                                x: window.scrollX || window.pageXOffset,
                                y: window.scrollY || window.pageYOffset
                            };
                        }
                    } else {
                        if (options.enableScroll) {
                            window.scrollTo(0, 0);
                            debug('on click navigation, reset scroll position to (0, 0)');
                        }
                        if (options.saveScrollInState) {
                            historyState.scroll = {x: 0, y: 0};
                        }
                    }
                    var pageTitle = navParams.pageTitle || null;
                    if (navType === TYPE_REPLACESTATE) {
                        this._history.replaceState(historyState, pageTitle, nav.url);
                    } else {
                        this._history.pushState(historyState, pageTitle, nav.url);
                    }
                    break;
                case TYPE_POPSTATE:
                    if (options.enableScroll) {
                        historyState = (this._history.getState && this._history.getState()) || {};
                        var scroll = (historyState && historyState.scroll) || {};
                        debug('on popstate navigation, restore scroll position to ', scroll);
                        window.scrollTo(scroll.x || 0, scroll.y || 0);
                    }
                    break;
            }
        },

        render: function () {
            var props = Component.prototype && Component.prototype.isReactComponent ? {ref: 'wrappedElement'} : null;
            return React.createElement(Component, Object.assign({}, this.props, props));
        }
    });

    // Copy statics to HistoryHandler
    hoistNonReactStatics(HistoryHandler, Component);

    HistoryHandler.wrappedComponent = HistoryHandler.WrappedComponent = Component;

    return handleRoute(HistoryHandler);
}

/**
 * Enhances a component to handle history management based on RouteStore
 * state.
 * @param {React.Component} Component
 * @param {object} opts
 * @param {boolean} opts.checkRouteOnPageLoad=false Performs navigate on first page load
 * @param {boolean} opts.enableScroll=true Scrolls to saved scroll position in history state;
 *                  scrolls to (0, 0) if there is no scroll position saved in history state.
 * @param {function} opts.historyCreator A factory for creating the history implementation
 * @param {boolean|function} opts.ignorePopstateOnPageLoad=false A boolean value or a function that
 *                  returns a boolean value. Browsers tend to handle the popstate event
 *                  differently on page load. Chrome (prior to v34) and Safari always emit
 *                  a popstate event on page load, but Firefox doesn't
 *                  (https://developer.mozilla.org/en-US/docs/Web/Events/popstate)
 *                  This flag is for ignoring popstate event triggered on page load
 *                  if that causes issue for your application, as reported in
 *                  https://github.com/yahoo/fluxible/issues/349.
 * @returns {React.Component}
 */
module.exports = function handleHistory(Component, opts) {
    // support decorator pattern
    if (arguments.length === 0 || typeof arguments[0] !== 'function') {
        opts = arguments[0];
        return function handleHistoryDecorator(componentToDecorate) {
            return createComponent(componentToDecorate, opts);
        };
    }

    return createComponent.apply(null, arguments);
};
