# Fluxible-Router Quick Start

## Register a Route Store

The library has a built-in [`RouteStore`](./api/RouteStore.md) that needs to be registered to your application:

```js
// app.js

var Fluxible = require('fluxible');
var RouteStore = require('fluxible-router').RouteStore;
var routes = require('./configs/routes');

var app = new Fluxible({
    component: require('./components/App.jsx')
});

var MyRouteStore = RouteStore.withStaticRoutes(routes);

app.registerStore(MyRouteStore);

module.exports = app;
```

## Add Route Config

Route paths follow the same rules as [path-to-regexp](https://github.com/pillarjs/path-to-regexp) library.

```js
// configs/routes.js
module.exports = {
    home: {
        method: 'GET',
        path: '/',
        handler: require('../components/Home.jsx'),
        // Executed on route match
        action: require('../actions/loadHome')
    },
    about: {
        method: 'GET',
        path: '/about',
        handler: require('../components/About.jsx')
    },
    user: {
        method: 'GET',
        path: '/user/:id',
        handler: require('../components/User.jsx')
    }
};
```

## Call the Navigate Action

On the server (or client in client-only apps) where you handle the initial request, call the navigate action with the request url:

```js
// server.js
var app = require('./app');
var navigateAction = require('fluxible-router').navigateAction;

// ...
    var context = app.createContext();
    context.executeAction(navigateAction, {
        url: url // e.g. req.url
    }, function (err) {
        var html = React.renderToString(context.createElement());
        res.write(html);
        res.end();
    });
// ...
```

## Use it in your components

```js
// components/App.jsx
var provideContext = require('fluxible').provideContext;
var handleHistory = require('fluxible-router').handleHistory;
var NavLink = require('fluxible-router').NavLink;

var AppComponent = React.createClass({
    render: function () {
        // Get the handler from the current route which is passed in as prop by the history handler
        var Handler = this.props.currentRoute.get('handler');

        return (
            <div>
                <ul>
                    // Create client handled links using NavLink anywhere in your application
                    // activeStyle will apply the styles when it's the current route
                    <li><NavLink href='/home' activeStyle={{backgroundColor: '#ccc'}}>Home</NavLink></li>
                    // RouteName will build the href from the route with the same name
                    // Active class will apply the class when it's the current route
                    <li><NavLink routeName='about' activeClass='selected'>About</NavLink></li>
                    // You can also add parameters to your route if it's a dynamic route
                    <li><NavLink routeName='user' navParams={{id: 1}}>User 1</NavLink></li>
                </ul>
                <Handler />
            </div>
        );
    }
});

// wrap with history handler
AppComponent = handleHistory(AppComponent);

// and wrap that with context
AppComponent = provideContext(AppComponent);

module.exports = AppComponent;
```
