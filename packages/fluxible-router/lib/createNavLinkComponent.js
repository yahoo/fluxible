/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';
var React = require('react');
var RouteStore = require('./RouteStore');
var debug = require('debug')('NavLink');
var navigateAction = require('./navigateAction');

function isLeftClickEvent (e) {
    return e.button === 0;
}

function isModifiedEvent (e) {
    return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}

function shouldListen(props) {
    return props.activeClass || props.activeStyle || props.activeElement;
}

/**
 * create NavLink component with custom options
 * @param {Object} overwriteSpec spec to overwrite the default spec to create NavLink
 * @returns {React.Component} NavLink component
 */
module.exports = function createNavLinkComponent (overwriteSpec) {
    var NavLink = React.createClass(Object.assign({}, {
        autobind: false,
        displayName: 'NavLink',
        contextTypes: {
            executeAction: React.PropTypes.func.isRequired,
            getStore: React.PropTypes.func.isRequired
        },
        propTypes: {
            href: React.PropTypes.string,
            stopPropagation: React.PropTypes.bool,
            routeName: React.PropTypes.string,
            navParams: React.PropTypes.object,
            queryParams: React.PropTypes.object,
            followLink: React.PropTypes.bool,
            preserveScrollPosition: React.PropTypes.bool,
            replaceState: React.PropTypes.bool,
            validate: React.PropTypes.bool,
            activeClass: React.PropTypes.string,
            activeElement: React.PropTypes.string,
            activeStyle: React.PropTypes.object
        },
        getInitialState: function () {
            return this._getState(this.props);
        },
        startListening: function () {
            var routeStore = this.context.getStore(RouteStore);
            this._onRouteStoreChange = this.constructor.prototype._onRouteStoreChange.bind(this);
            routeStore.addChangeListener(this._onRouteStoreChange);
        },
        stopListening: function () {
            var routeStore = this.context.getStore(RouteStore);
            routeStore.removeChangeListener(this._onRouteStoreChange);
        },
        componentDidMount: function () {
            if (this.props.activeClass || this.props.activeStyle) {
                this.startListening();
            }
        },
        componentWillUnmount: function () {
            if (this.props.activeClass || this.props.activeStyle) {
                this.stopListening();
            }
        },
        componentDidUpdate: function (prevProps, prevState) {
            var prevListening = shouldListen(prevProps);
            var shouldBeListening = shouldListen(this.props);
            if (prevListening && !shouldBeListening) {
                this.stopListening();
            }
            if (!prevListening && shouldBeListening) {
                this.startListening();
                // Force an update to sync with store
                this._onRouteStoreChange();
            }
        },
        shouldComponentUpdate: function (nextProps, nextState) {
            return (
                nextProps !== this.props ||
                this.state.currentRoute !== nextState.currentRoute
            );
        },
        componentWillReceiveProps: function (nextProps) {
            this.setState(this._getState(nextProps));
        },
        _onRouteStoreChange: function () {
            if (this.isMounted()) {
                this.setState(this._getState(this.props));
            }
        },
        _getState: function (props) {
            var routeStore = this.context.getStore(RouteStore);
            return {
                currentRoute: routeStore.getCurrentRoute()
            };
        },
        _getHrefFromProps: function (props) {
            var href = props.href;
            var routeName = props.routeName;
            var routeStore = this.context.getStore(RouteStore);
            var navParams = this.getNavParams(props);
            var queryParams = this.getQueryParams(props);
            if (!href && routeName) {
                href = routeStore.makePath(routeName, navParams, queryParams);
            }
            if (!href) {
                throw new Error('NavLink created without href or unresolvable ' +
                    'routeName \'' + routeName + '\' with params ' +
                    JSON.stringify(navParams));
            }
            return href;
        },
        /**
         * Default getDefaultChildProps function, return empty object
         * @method getDefaultChildProps
         * @return {Object} default child props
         */
        getDefaultChildProps: function () {
            return {};
        },
        /**
         * Default getNavParams function, return props.navParams
         * @method getNavParams
         * @param {Object} props props object
         * @return {Object} nav params
         */
        getNavParams: function (props) {
            return props.navParams;
        },
        /**
         * Default getQueryParams function, return props.queryParams
         * @method getQueryParams
         * @param {Object} props props object
         * @return {Object} query params
         */
        getQueryParams: function (props) {
            return props.queryParams;
        },
        /**
         * Default shouldFollowLink, return props.followLink
         * @method shouldFollowLink
         * @param {Object} props props object
         * @return {Boolean} should follow link value
         */
        shouldFollowLink: function(props) {
            return props.followLink;
        },
        dispatchNavAction: function (e) {
            var navParams = this.getNavParams(this.props);
            var navType = this.props.replaceState ? 'replacestate' : 'click';
            var shouldFollowLink = this.shouldFollowLink(this.props);
            var routeStore = this.context.getStore(RouteStore);
            debug('dispatchNavAction: action=NAVIGATE', this.props.href, shouldFollowLink, navParams);

            if (this.props.stopPropagation) {
                e.stopPropagation();
            }

            if (shouldFollowLink) {
                return;
            }

            if (isModifiedEvent(e) || !isLeftClickEvent(e)) {
                // this is a click with a modifier or not a left-click
                // let browser handle it natively
                return;
            }

            var href = this._getHrefFromProps(this.props);

            if (href[0] === '#') {
                // this is a hash link url for page's internal links.
                // Do not trigger navigate action. Let browser handle it natively.
                return;
            }

            if (href[0] !== '/') {
                // this is not a relative url. check for external urls.
                var location = window.location;
                var origin = location.origin || (location.protocol + '//' + location.host);

                if (href.indexOf(origin) !== 0) {
                    // this is an external url, do not trigger navigate action.
                    // let browser handle it natively.
                    return;
                }

                href = href.substring(origin.length) || '/';
            }

            if (this.props.validate && !routeStore.getRoute(href)) {
                return;
            }

            e.preventDefault();

            var context = this.props.context || this.context;
            var onBeforeUnloadText = typeof window.onbeforeunload === 'function' ? window.onbeforeunload() : '';
            var confirmResult = onBeforeUnloadText ? window.confirm(onBeforeUnloadText) : true;

            if (confirmResult) {
                // Removes the window.onbeforeunload method so that the next page will not be affected
                window.onbeforeunload = null;

                context.executeAction(navigateAction, {
                    type: navType,
                    url: href,
                    preserveScrollPosition: this.props.preserveScrollPosition,
                    params: navParams
                });
            }
        },
        clickHandler: function (e) {
            this.dispatchNavAction(e);
        },
        render: function () {
            var href = this._getHrefFromProps(this.props);

            var isActive = false;
            if (this.props.activeClass || this.props.activeStyle || this.props.activeElement) {
                var routeStore = this.context.getStore(RouteStore);
                isActive = routeStore.isActive(href);
            }

            var style = this.props.style;
            var className = this.props.className;
            if (isActive) {
                if (this.props.activeClass) {
                    className = className ? (className + ' ') : '';
                    className += this.props.activeClass;
                }
                if (this.props.activeStyle) {
                    style = Object.assign({}, this.props.style, this.props.activeStyle);
                }
            }

            var childProps = this.getDefaultChildProps();

            if (!(isActive && this.props.activeElement)) {
                childProps.onClick = this.clickHandler.bind(this);
            }

            Object.assign(childProps, this.props, {
                className: className,
                style: style
            });

            if (!(isActive && this.props.activeElement)) {
                childProps.href = href;
            }

            var childElement = isActive ? this.props.activeElement || 'a' : 'a';

            return React.createElement(
                childElement,
                childProps,
                this.props.children
            );
        }
    }, overwriteSpec));
    return NavLink;
};
