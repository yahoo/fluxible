# Routing

In this tutorial we'll cover the concepts of building an isomorphic website
with Fluxible that demonstrates routing.

This isn't a step-by-step guide. Our main goal is to highlight what we think
are the most important concepts.

You can find the most up to date code on GitHub here: [Fluxible router
example](https://github.com/yahoo/flux-examples/tree/master/fluxible-router).


### Hello World

Let's start by creating a very basic React component.

File: `/components/Application.jsx`

```js
var React = require('react');

var Application = React.createClass({
    render: function (){
        return <div>Hello World!</div>;
    }
});

module.exports = Application;
```

We render this component server side using Express. Here is what our server
code looks like:

File: `/server.js`

```js
// this allows us to require .jsx files
require('node-jsx').install({ extension: '.jsx' });

var React = require('react');
var App = require('./components/Application.jsx');
var express = require('express');

var Component = React.createFactory(App);
var server = express();
var port = process.env.PORT || 3000;

// all requests to the server return the html
server.use(function (req, res, next) {
    var component = Component();
    var html = React.renderToString(component);
    res.send(html);
});

server.listen(port, function () {
    console.log('Listening on port ' + port);
});
```


### Using Routes

To show off routing we need more than one page. First we create Home and About
components.

File: `/components/Home.jsx`

```js
var React = require('react');

module.exports = React.createClass({
    render: function (){
        return <div>Welcome to the site!</div>;
    }
});
```

File: `/components/About.jsx`

```js
var React = require('react');

module.exports = React.createClass({
    render: function (){
        return <div>This is all about us.</div>;
    }
});
```

We also need to define our routes, which we'll use shortly.

File: `/configs/routes.js`

```js
module.exports = {
    home: {
        path: '/',
        method: 'get',
        label: 'Home',
        page: 'home'
    },
    about: {
        path: '/about',
        method: 'get',
        label: 'About',
        page: 'about'
    }
};
```


### Application Store

Next we'll create an `ApplicationStore`. The sole purpose of this store is to
keep track of which page is currently displayed.

File: `/stores/ApplicationStore.js`

```js
// this is a util that ships with Fluxible
var createStore = require('fluxible/utils/createStore');
// we created these in the last step
var routes = require('../configs/routes');

var ApplicationStore = createStore({
    storeName: 'ApplicationStore',
    handlers: {
        'CHANGE_ROUTE_SUCCESS': '_handleNavigate'
    },
    initialize: function (dispatcher) {
        this.currentPageName = null;
        this.currentPage = null;
        this.currentRoute = null;
        this.pages = routes;
    },
    _handleNavigate: function (route) {
        var pageName = route.name;
        var page = this.pages[pageName];

        if (pageName === this.getCurrentPageName()) {
            return;
        }

        this.currentPageName = pageName;
        this.currentPage = page;
        this.currentRoute = route;
        this.emitChange();
    },
    getCurrentPageName: function () {
        return this.currentPageName;
    },
    getState: function () {
        return {
            currentPageName: this.currentPageName,
            currentPage: this.currentPage,
            pages: this.pages,
            route: this.currentRoute
        };
    }
});

module.exports = ApplicationStore;
```

We defined an action handler for the `CHANGE_ROUTE_SUCCESS` action. The store
listens for this action and calls `_handleNavigate` when it hears it.

The `_handleNavigate` method takes the payload (in this case a route object) and
updates the store properties accordingly.

Remember, the store doesn't do any rendering, it just keeps track of what page
should be rendered.


### Application Component Updates

Let's make our original application component a little smarter. We'll include
the `ApplicationStore` we just created. We also use the
[`FluxibleMixin`](/api/fluxible.html), which adds convenient methods to interact
with stores.

File: `/components/Application.jsx`

```js
var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var Home = require('./Home.jsx');
var About = require('./About.jsx');
var FluxibleMixin = require('fluxible').Mixin;

var Application = React.createClass({
    mixins: [ FluxibleMixin ],
    getInitialState: function () {
        return this.getStore(ApplicationStore).getState();
    },
    render: function (){
        return (
            <div>
                {'home' === this.state.currentPageName ? <Home/> : <About/>}
            </div>
        );
    }
});

module.exports = Application;
```

In this simple example you can see that we're using `state.currentPageName` to
determine which component should render.


### Enter Fluxible

Now that we have all the pieces in place, it's time pull them together.

File: `/app.js`

```js
var React = require('react');
var Fluxible = require('fluxible');
var routrPlugin = require('fluxible-plugin-routr');
var routes = require('./configs/routes');
var App = require('./components/Application.jsx');
var Component = React.createFactory(App);
var ApplicationStore = require('./stores/ApplicationStore');

var app = new Fluxible({
    component: Component
});

app.plug(routrPlugin({
    routes: routes
}));

app.registerStore(ApplicationStore);

module.exports = app;
```

We're creating our `app` by creating a `new Fluxible()` instance and defining
`./components/Application.jsx` as our top-level component.

We're adding the `routrPlugin` to our `app`, and telling it to use the routes
we defined earlier.

We also register the `ApplicationStore` with our `app`.


### Server Updates

Now we need to update the middleware handler in `/server.js`, so it uses
Fluxible.

```js
server.use(function (req, res, next) {
    var context = app.createContext();
    var params = {
        url: req.url
    };

    context.getActionContext().executeAction(navigateAction, params, function (err) {
        if (err) {
            if (err.status && err.status === 404) {
                next();
            } else {
                next(err);
            }
            return;
        }

        var Component = app.getComponent();
        var component = Component({
            context: context.getComponentContext()
        });
        var html = React.renderToString(component);

        res.send(html);
    });
});
```

Let's run through what the request lifecycle entails.

 1. A new request is made by the browser and `/server.js` receives it.
 2. Our middleware takes over and creates a new context. _(Fluxible uses
    contexts to encapsulate data which prevents data leaking between requests)_
 3. The middleware executes `navigateAction` internally and passes it the
    current route as a param. _(`navigateAction` is a convenient method defined on
    the `flux-router-component` library. It helps us deal with route matching)_
 4. [`navigateAction`](https://github.com/yahoo/flux-router-component/blob/master/actions/navigate.js)
    uses the `routrPlugin` to look for a matching route.
    - If a match is found, a `CHANGE_ROUTE_SUCCESS` action is dispatched.
    - If a match is not found, an error with 404 status is provided to the callback.
 5. The `CHANGE_ROUTE_SUCCESS` action is dispatched to all stores registered with the app.
 6. `ApplicationStore` hears this action and executes its `_handleNavigate`
    method and updates its state.
 7. The `navigateAction` callback is executed. Inside the callback, a new
    `Application` component instance is created, and is handed the current context.
    The context contains, among other things, the updated `ApplicationStore`.
 8. We render the `Component` as a string, and send the result as our
    response. Since the `Component` gets its state from the
    `ApplicationStore`, the correct page is rendered. _(the `getStore` method
    provided by the `FluxibleMixin` knows how to get stores from the provided context.)_

The application should now be working. If we visit `http://localhost:3000/` we'll
see our Home page, and if we visit `http://localhost:3000/about` we'll see our
About page.


### Add a NavBar

Ok now things are working let's add a navigation bar so we can click to
navigate the different pages.

Let's create a component that renders one `NavLink` for each available page. A
`NavLink` is a special React component defined by the `flux-router-component`
library, which executes the `navigateAction` when clicked.

File: `/components/Nav.jsx`

```js
var React = require('react');
var NavLink = require('flux-router-component').NavLink;

var Nav = React.createClass({
    getInitialState: function () {
        return {
            selected: 'home',
            links: {}
        };
    },
    render: function () {
        var selected = this.props.selected || this.state.selected;
        var links = this.props.links || this.state.links;
        var linkHTML = Object.keys(links).map(function (name) {
            var className = '';
            var link = links[name];

            if (selected === name) {
                className = 'pure-menu-selected';
            }

            return (
                <li className={className} key={link.path}>
                    <NavLink href={link.path} routeName={link.page}>
                        {link.label}
                    </NavLink>
                </li>
            );
        });

        return (
            <ul className="pure-menu pure-menu-open pure-menu-horizontal">
                {linkHTML}
            </ul>
        );
    }
});

module.exports = Nav;
```

Now we just need to update `/components/Application.jsx` so it renders our
`Nav` component.

```js
var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var Home = require('./Home.jsx');
var About = require('./About.jsx');
var Nav = require('./Nav.jsx');
var FluxibleMixin = require('fluxible').Mixin;

var Application = React.createClass({
    mixins: [ FluxibleMixin ],
    getInitialState: function () {
        return this.getStore(ApplicationStore).getState();
    },
    render: function () {
        return (
            <div>
                <Nav selected={this.state.currentPageName} links={this.state.pages} />
                {'home' === this.state.currentPageName ? <Home/> : <About/>}
            </div>
        );
    }
});

module.exports = Application;
```

While this is enough for the `NavBar` to work, let's add some styling to the page
to make it look nicer. Start by creating an `Html` component to render a base
template for our application. Among other things, this base template will make
sure to fetch some styles from the Pure CSS library.

File: `/components/Html.jsx`

```js
var React = require('react');

module.exports = React.createClass({
    render: function () {
        return (
            <html>
                <head>
                    <meta charSet="utf-8" />
                    <title>{this.props.title}</title>
                    <meta name="viewport" content="width=device-width, user-scalable=no" />
                    <link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/pure-min.css" />
                </head>
                <body>
                    <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
                </body>
            </html>
        );
    }
});
```

Finally, let's modify `/server.js` so it renders our App component inside our
new HTML component.

```js
// ...
var HtmlComponent = React.createFactory(require('./components/Html.jsx'));

// ...

    React.withContext(context.getComponentContext(), function () {
        var html = React.renderToStaticMarkup(HtmlComponent({
            markup: React.renderToString(Component())
        }));
    });

// ...
```


### Client Side

Up to this point all we've really done is create a traditional web application.
We're still missing the client side code to get a real isomorphic application
in place.

The first thing we need is a way to have our server send the current state of
the app to the client, so the client can then recreate it locally. Fluxible
expects each store to define a `dehydrate` function to serialize its state, and
a `rehydrate` function to de-serialize it.

We need to define these hydrate functions on our `ApplicationStore`:

```js
// ...
dehydrate: function () {
    return {
        currentPageName: this.currentPageName,
        currentPage: this.currentPage,
        pages: this.pages,
        route: this.currentRoute
    };
},
rehydrate: function (state) {
    this.currentPageName = state.currentPageName;
    this.currentPage = state.currentPage;
    this.pages = state.pages;
    this.currentRoute = state.route;
}
// ...
```

Then we need to modify `/server.js` so it attaches the current app state on the
Express response object.

```js
var expressState = require('express-state');
expressState.extend(server);

server.use(function (req, res, next) {
    var context = app.createContext();
    var params = {
        url: req.url
    };

    context.getActionContext().executeAction(navigateAction, params, function (err) {
        if (err) {
            if (err.status && err.status === 404) {
                next();
            } else {
                next(err);
            }
            return;
        }

        res.expose(app.dehydrate(context), 'App');

        var Component = app.getComponent();
        React.withContext(context.getComponentContext(), function () {
            var html = React.renderToStaticMarkup(HtmlComponent({
                state: res.locals.state,
                markup: React.renderToString(Component())
            }));

            res.send(html);
        });
    });
});
```

We're extending our Express server with the
[`express-state`](https://github.com/yahoo/express-state) library. This library
adds an `expose` method to the Express response object. Whatever we set with
`expose` will be available on the response object's `locals.state`.

You'll see we calling `expose` on the response object, telling it to hold on to our
dehydrated app state.

We're passing `res.locals.state` as a prop to our `HtmlComponent` component.

Now we can create a client app that grabs the dehydrated state sent by the
server and rehydrates itself before re-rendering and taking over.

File: `/client.js`

```js
var React = require('react');
var app = require('./app');
var dehydratedState = window.App; // Sent from the server

window.React = React; // For chrome dev tool support

app.rehydrate(dehydratedState, function (err, context) {
    if (err) {
        throw err;
    }
    var mountNode = document.getElementById('app');

    React.withContext(context.getComponentContext(), function () {
        React.render(app.getComponent()(), mountNode);
    });
});
```

We'll need a way to bundle up the client app so the browser can read it, so
we'll use Webpack and the `jsx-loader`. The following config file should be
enough to have it working:

File: `/webpack.config.js`

```js
var webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    entry: './client.js',
    output: {
        path: __dirname+'/build/js',
        filename: 'client.js'
    },
    module: {
        loaders: [
            { test: /\.jsx$/, loader: 'jsx-loader' }
        ]
    }
};
```

If you run `$ webpack --config=webpack.config.js` you'll see the bundled
`client.js` in `/build/js`, we'll need to expose this asset in the server by
adding `server.use(express.static('build'));` to `/server.js`.

At this point our client side app should be able to take over after the HTML is
finished rendering.

Although the client app re-renders after it rehydrates, we shouldn't see any
flashing. This is because React compares the new render with the current DOM
state, and won't update the DOM unless something has actually changed.

However, if you try switching between pages, you'll notice the `NavBar` is now
broken. Even though the `navigateAction` is being executed on click, and our
`ApplicationStore` is being updated, our `Component` is not re-rendering.

This is easy to fix. Let's add a store listener so our `Component`
updates whenever the `ApplicationStore` changes.

File: `/components/Application.jsx`

```js
var React = require('react');
var Home = require('./Home.jsx');
var About = require('./About.jsx');
var Nav = require('./Nav.jsx');
var ApplicationStore = require('../stores/ApplicationStore');
var RouterMixin = require('flux-router-component').RouterMixin;
var FluxibleMixin = require('fluxible').Mixin;

var Application = React.createClass({
    mixins: [ RouterMixin, FluxibleMixin ],
    statics: {
            storeListeners: [ ApplicationStore ]
    },
    getInitialState: function () {
        return this.getStore(ApplicationStore).getState();
    },
    onChange: function () {
            var state = this.getStore(ApplicationStore).getState();
            this.setState(state);
    },
    render: function(){
        return (
            <div>
                <Nav selected={this.state.currentPageName} links={this.state.pages} />
                {'home' === this.state.currentPageName ? <Home/> : <About/>}
            </div>
        );
    }
});

module.exports = Application;
```

We're adding a store listener for the `ApplicationStore`. Whenever a store
we're listening to emits a `change` event, our component's `onChange` function
will be called (this functionality is provided by the `FluxibleMixin`).

Our `onChange` function just gets a new state by asking the `ApplicationStore` for
its current state.

You should now see the correct pages being rendered when you click on the
`NavBar`, but you might notice the browser's URL is not actually changing. This
can also be easily fixed, by using the `RouterMixin` provided by the
`flux-router-component` library.

The `RouterMixin` updates the browser history whenever a route changes, and also
handles popstate events (when a user clicks on the browser's back button) in a
Flux-appropiate way.

In: `/components/Application.jsx`

```js
var RouterMixin = require('flux-router-component').RouterMixin;
var FluxibleMixin = require('fluxible').Mixin;

var Application = React.createClass({
    mixins: [RouterMixin, FluxibleMixin],
```


### Conclusion

Now we've seen how easy it is to create an isomorphic application with
multiple routes by using Fluxible.


## Community Love

This content is a slightly modified version of Alexis Hevia's blog post:
[Isomorphic React + Flux using Yahoo's Fluxible][alexis-post].


[//]: # (link references)

[alexis-post]: http://dev.alexishevia.com/2014/11/isomorphic-react-flux-using-yahoos.html
