# Bringing Flux to the Server

<div class="speakerdeck-container nested">
    <iframe class="speakerdeck-iframe" width="100%" height="350" frameborder="0" src="//speakerdeck.com/player/87ecaa3048750132f42542ffc18c6fcf?" allowFullScreen="true"></iframe>
</div>

The reality of working at Yahoo is that we have a wide range of web applications from simple article viewers to rich interactive fantasy sports experiences. These types of applications have different needs: articles need to be served extremely quickly but have relatively small amounts of user interaction.

For use cases such as fantasy sports, we need rich client interaction with full page transitions without returning to the server. This involves complex application state management and DOM synchronization.

It's not as simple as just choosing a different architecture for each application though. A lot of times these products become intertwined: a fantasy application will have news feeds containing articles about specific players or teams. The fantasy application should be able to use of the same components that a sports news page is using. This necessitates that the component that is used should be usable both on the server using node.js and the client. Ideally the architecture for both of these use cases could be the same, allowing us to add in richness to our article pages while also allowing us to render our fantasy components on an article page.

## Battling Complexity

In the past we have solved these use cases by using completely different languages on the server vs. the client. This means duplicate code written for the two different contexts and increased complexity for developers to understand the stack.

We've been migrating many of our applications to Node.js so that we're at least sharing the same language and we've been able to share more and more libraries. Due to usage of different frameworks (YUI on the client and custom hierarchical MVC built on Express in the server), we've still been duplicating the logic for rendering the page even if the templates were shared.

The obvious solution is to share more and more of those libraries until you're left with only a sliver of your application that changes based on context. Ideally these differences can be abstracted into framework code, so as an application developer you only have to worry about writing application logic and having it work on the server and the client.

## Why Server Rendering?

So why do server rendering at all? Some would say that you can reduce this complexity by only doing client rendering and serve a blank page to the user initially. There are several benefits to using server rendering though:

 * **Search Engine Optimization** - Search engines are getting better at running JavaScript, but the reality is that a plain old HTML document will be the most robust
 * **Legacy Browser Support** - When you're supporting older browsers where JavaScript execution is brittle, it can be easier to just disable JavaScript completely and let HTTP work as it's intended.
 * **User Perceived Performance** - Getting markup on to the page immediately on the server response gives the users what they want quickly. You may need to do additional loading of JavaScript, but metrics show that user-perceived performance is critical.

Performance is our primary concern here. Single page apps that need round trips for fetching JavaScript and data before rendering markup have a theoretical minimum amount of time before a user can see the page. Metrics are pretty clear that the faster you can respond and display information to a user, the more likely they are to stick around and view more pages. Guillermo Rauch talks about this in a great blog post about the ["7 Principles of Rich Web Applications"](http://rauchg.com/2014/7-principles-of-rich-web-applications/).

## React and Flux?

React gives us exactly what we needed for both of these use cases. It allows us to render individual components in both environments. The question remained about the rest of the architecture.

Flux makes great strides in reducing complexity for single page apps and we loved the unidirectional flow that it enforces. Our concern was whether this architecture would work on the server. After experimenting with different methods, we have found that the Flux philosophy can be extended to support both server and client application workflows.

## Flux on the Server

Let's jump into some code. I'm making the assumption that you have looked at [Flux](https://github.com/facebook/flux/) and potentially looked through the example [chat application](https://github.com/facebook/flux/tree/master/examples/flux-chat). We're going to take this example, simplify it a bit for brevity, and make it work on the server, giving us a fully server-rendered Flux application that is then bootstrapped on the client.

### Client Side Application ([Full Code](https://github.com/mridgway/isomorphic-chat/tree/2107667ef0020fa63fc27d25deeee1be73f56f19))

Let's first look at what a Flux application looks like when it's client-side only using Facebook's dispatcher:

```html
// index.html
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <div id="app">

        </div>
    </body>
    <script src="./build/js/client.js"></script>
</html>
```

```js
// client.js
var React = require('react');
var ChatApp = React.createFactory(require('./components/ChatApp.jsx'));


var showMessages = require('./actions/showMessages');
React.render(ChatApp(), document.getElementById('app'), function (err) {
    if (err) {
        throw err;
    }
    showMessages();
});
```

```js
// actions/showMessages.js
var messages = require('../data/messages');
var dispatcher = require('../lib/dispatcher');

module.exports = function showMessages() {
    dispatcher.dispatch({
        type: 'RECEIVE_MESSAGES',
        messages: messages
    });
};
```

```js
// lib/dispatcher.js
var Dispatcher = require('flux').Dispatcher;

module.exports = new Dispatcher();
```

```js
// stores/MessageStores.js
var dispatcher = require('../lib/dispatcher');
var objectAssign = require('object-assign');
var EventEmitter = require('events').EventEmitter;

var messages = [];
var MessageStore = objectAssign({}, EventEmitter.prototype, {
    onAddMessage: function (message) {
        messages.push(message);
        MessageStore.emitChange();
    },
    onReceiveMessages: function (msgs) {
        messages = messages.concat(msgs);
        MessageStore.emitChange();
    },
    emitChange: function () {
        MessageStore.emit('change');
    },
    getAllMessages: function () {
        return messages;
    },
    addChangeListener: function (listener) {
        MessageStore.on('change', listener);
    },
    removeChangeListener: function (listener) {
        MessageStore.removeListener(listener);
    }
});

dispatcher.register(function (payload) {
    switch (payload.type) {
        case 'RECEIVE_MESSAGES':
            MessageStore.onReceiveMessages(payload.messages);
            return;
        case 'ADD_MESSAGE':
            MessageStore.onAddMessage(payload.message);
            return;
        default:
            throw new Error('No handler found');
    }
});

module.exports = MessageStore;
```

### Adding the Server ([Full Diff](https://github.com/mridgway/isomorphic-chat/commit/ddeb9c89108a8d0330b1711745d9f6f60d2a0a51))

When working in the client, a user initiated event could be a click or a form submit. On the server we only have one incoming event, an HTTP request. This is where our server-side Flux flow begins:

```js
// server.js
var express = require('express');
var showMessages = require('./actions/showMessages');
var server = express();

server.get('/', function (req, res, next) {
    showMessages({});

    var html = React.renderToString(ChatComponent());
    res.send(html);
});

server.listen(process.env.PORT, 3000);
```

Simple enough. We're just calling the `showMessages` action which synchronously dispatches the message data.

This is an naive example though, so let's take a look at making this more real.

### Asynchronous Actions ([Full Diff](https://github.com/mridgway/isomorphic-chat/commit/619eee346ebb9df3f6cede6979508f72cd565cfe))

What if that action needs to fetch data asynchronously? Let's fetch the message data from a remote endpoint.

```js
// actions/showMessages.js
var superagent = require('superagent');
var dispatcher = require('./dispatcher');
module.exports = function showMessages(payload) {
    superagent
        .get('https://rawgit.com/mridgway/10be75846faa22eb6e22/raw/')
        .set('Accept', 'application/json')
        .end(function (res) {
            var messages = JSON.parse(res.text);
            dispatcher.dispatch('RECEIVE_MESSAGES', messages);
        });
};
```

Now we need the middleware to wait until the data is ready before rendering the application component:

```js
// server.js
var express = require('express');
var showMessages = require('./actions/showMessages');
var server = express();

server.get('/', function (req, res, next) {
    showMessages({}, function showMessagesCallback() { //add a callback
        var html = React.renderToString(ChatComponent());
        res.send(html);
    });
});

server.listen(process.env.PORT, 3000)
```

Now let's add that callback as a parameter in the action creator

```js
// actions/showMessages.js
var superagent = require('superagent');
module.exports = function showMessages(payload, done) {
    superagent
        .get('http://yahoo.com/api/ChatExampleData.json')
        .set('Accept', 'application/json')
        .end(function (res) {
            var messages = JSON.stringify(res.body);
            dispatcher.dispatch('RECEIVE_MESSAGES', messages);
            done(); // call the callback
        });
};
```

### Isolating Your Data ([Full Diff](https://github.com/mridgway/isomorphic-chat/commit/1c3e1c8c49aacea8175ef75fb34392da66592fb5))

Ok, so far so good. But what if the messages are user specific? In a concurrent environment like node.js, this global `messages` object will bleed between requests and suddenly user data could show up for other users.

Let's take another look at the store:

```js
// stores/MessageStore.js
var messages = [];
var MessageStore = Object.assign({}, EventEmitter.prototype, {
    onReceiveMessages: function (payload) {
        messages = messages.concat(payload);
        MessageStore.emitChange();
    },
    emitChange: function () {
        MessageStore.emit('change');
    },
    getAllMessages: function () {
        return messages;
    }
});
var dispatcher = require('./dispatcher');
dispatcher.register('RECEIVE_MESSAGES', MessageStore.onReceiveMessages);

module.exports = MessageStore;
```

`messages` is being stored in a static variable that is shared across requests. In order to make this store request specific, we'll turn it into a class that can then be instantiated per request.

```js
// stores/MessageStore.js
var MessageStore = function () {
    this.messages = [];
};

Object.assign(MessageStore.prototype, EventEmitter.prototype, {
    onReceiveMessages: function (payload) {
        this.messages = this.messages.concat(payload);
        this.emitChange();
    },
    emitChange: function () {
        this.emit('change');
    },
    getAllMessages: function () {
        return this.messages;
    }
});

module.exports = MessageStore;
```

Ok, that was fairly simple. We're now exporting a store class instead of a store instance. But a piece has been removed:

```js
var dispatcher = require('./dispatcher');
dispatcher.register('RECEIVE_MESSAGES', MessageStore.onReceiveMessages);
```

There's an issue here, the `onReceiveMessages` function needs to be bound to the store instance which is created per request. We can no longer statically register the store instance to the dispatcher.

You also don't want several instances of the `MessageStore` listening for the same actions either otherwise the data will be sent to all of them. The dispatcher itself needs to isolate its actions as well so that it's not emitting to all of the stores across all of the requests. So, the dispatcher itself needs to be isolated per request.

We've created a dispatcher that aids in this isolation: [dispatchr](https://github.com/yahoo/dispatchr). Let's update our local dispatcher library

```js
// lib/dispatcher.js
var Dispatcher = require('dispatchr')();
var MessageStore = require('../stores/MessageStore');

// Register the store constructors
Dispatcher.registerStore(MessageStore);

module.exports = Dispatcher;
```

And now we'll update the server to instantiate the dispatcher class per request. We'll also pass the dispatcher instance into the action as the first parameter so that it can dispatch on that specific instance.

```js
// server.js
var express = require('express');
var showMessages = require('./actions/showMessages');
var server = express();
var Dispatcher = require('./lib/dispatcher');

server.get('/', function (req, res, next) {
    var dispatcher = new Dispatchr();

    // Now the action needs access to the dispatcher too
    showMessages(dispatcher, {}, function () {
        var html = React.renderToString(ChatComponent());
        res.send(html);
    });
});

server.listen(process.env.PORT, 3000)
```

So now the `showMessages` action creator can no longer require the dispatcher directly, it will be passed in to the function as follows:

```js
var superagent = require('superagent');
module.exports = function showMessages(dispatcher, payload, done) {
    superagent
        .get('http://yahoo.com/api/ChatExampleData.json')
        .set('Accept', 'application/json')
        .end(function (res) {
            var messages = JSON.stringify(res.body);
            dispatcher.dispatch('RECEIVE_MESSAGES', messages);
            done();
        });
};
```

### Rendering Your Component

Alright, that completes the server side Flux flow, but now we have to render the React component and it needs to be able to get the state from the `MessagesStore`. We pass the dispatcher instance into the component so it can get the store instance:

```js
// server.js
//...
    showMessages(dispatcher, {}, function () {
        var html = React.renderToString(ChatComponent({
            dispatcher: dispatcher // Pass the constructor!
        }));
        res.send(html);
    });
//...
```

Now in the component we can call `this.props.dispatcher.getStore()`:

```js
// components/Chat.jsx
var MessagesStore = require('./stores/MessageStore');
var MessageSection = React.createClass({
    getInitialState: function() {
        // access the dispatcher instance
        var dispatcher = this.props.dispatcher;
        var messageStore = dispatcher.getStore(MessageStore);
        return {
            messages: messageStore.getAllMessages()
        };
    },
    render: function() {
        var messageListItems = this.state.messages.map(/*...*/);
        //...
    }

});

module.exports = MessageSection;
```

### Dehydration/Rehydration ([Full Diff](https://github.com/mridgway/isomorphic-chat/commit/cb21eed71b107741a0b263f3d46e0273797542dc))

Ok, so now the entire application is rendered server side. But when we get to the client how do we re-initialize our React component over top of the server rendered DOM?

React supports rendering on top of existing DOM if you use `React.render()` using the same component and passing the DOM node that wrapped your server rendered markup. But we want to make sure that when it renders client side that it will render the same markup, otherwise you'll get a redraw and a jarring pop-in for the user.

So, we essentially need to take the state of the application from the server and send it down to the client. All of your application state at this point should be available in your stores. Dispatchr provides a `dehydrate` and `rehydrate` function that will reach into each of your store instances and call a `dehydrate` and `rehydrate` function respectively.

```js
// stores/MessageStore.js
var MessageStore = function () {
    this.messages = [];
};

Object.assign(MessageStore.prototype, EventEmitter.prototype, {
    onReceiveMessages: function (payload) {
        this.messages = this.messages.concat(payload);
        this.emitChange();
    },
    emitChange: function () {
        this.emit('change');
    },
    getAllMessages: function () {
        return this.messages;
    },
    // Add these methods
    dehydrate: function () {
        return {
            messages: this.messages
        };
    },
    rehydrate: function (state) {
        this.messages = state.messages;
    }
});

module.exports = MessageStore;
```

So now on the server, we can use a library like “express-state” to send the full state down to the client.

```js
// server.js
//...
server.get('/', function (req, res, next) {
    var dispatcher = new Dispatchr();

    // Now the action needs access to the dispatcher too
    showMessages(dispatcher, {}, function () {
        var html = React.renderToString(ChatComponent({
            dispatcher: dispatcher
        }));
        // use express-state to expose the app state on window.App
        res.expose(dispatcher.dehydrate(), 'App');
        res.write('<div id="app">' + html + '</div>');
        res.send('<script>' + res.locals.state + '</script>');
    });
});
//...
```

Now the app state will be available on `window.App` on the client.

### On the Client

The client is meant to pick up where the server left off. We have the DOM and we have the dehydrated state, so we need to reinitialize our flux application and re-render React to get it ready for changes. You'll notice this will look pretty similar to the server, except now we don't need to be concerned with concurrency and we add a `rehydrate` call to set our stores back to the state they were in on the server.

```js
var Dispatcher = require('./lib/dispatcher');

// Our session dispatcher
var dispatcher = new Dispatcher();
// window.App contains our dehydrated state
dispatcher.rehydrate(window.App, function (err) {
    var mountNode = document.getElementById('app');
    var html = React.render(ChatComponent({
        dispatcher: dispatcher
    }), mountNode, function () {
        // React is done and everything is ready to go
    });
});
```

### Client Side Actions

With Flux, a component will have handlers that will call action creators and then listen for changes to the stores in order so that they can re-render themselves.

Notice that when we call the action creators, we need to provide access to the dispatcher instance, so we pass it in as the first parameter just like we did in the server code.

```js
var readMessage = require('./action/readMessage');
var MessagesStore = require('./stores/MessageStore');
var MessageSection = React.createClass({
    getInitialState: function () {
        return this.getState();
    },
    getState: function() {
        var dispatcher = this.props.dispatcher;
        var messageStore = dispatcher.getStore(MessageStore);
        return {
            messages: messageStore.getAllMessages()
        };
    },
    onClick: function (e) {
        readMessage(this.props.dispatcher, {/*payload*/});
    },
    onChange: function () {
        this.setState(this.getState());
    }
    componentDidMount: function () {
        this.props.dispatcher.getStore(MessageStore).on('change',  this.onChange);
    },
    render: function() {
        var messageListItems = this.state.messages.map(/*...*/);
        //...
    }

});

module.exports = MessageSection;
```

## Protecting Your Flow

One of the problems when working with hundreds of developers is making sure they don't do the wrong thing. Flux dictates that the flow should be unidirectional. Stores should not be dispatching actions. Components should call action creators instead of dispatching directly. If you provide the dispatcher to the components, they're now able to call the `dispatch` function.

Let's ensure that this flow is followed. Instead of passing the full dispatcher into the component, we can pass a limited interface to the component instead.

```js
//...
        var html = React.renderToString(ChatComponent({
            dispatcher: {
                getStore: dispatcher.getStore.bind(dispatcher)
            }
        }));
//...
```

Now the components only have access to the `getStore` method which will return the store instance. But we've created another problem: when a component calls an action creator, the dispatcher that is sent to the action creators doesn't have access to the dispatch method any more.

## Introducing the Fluxible Library

Fluxible's job is to take care of these concerns for you. It is a application wrapper that only exposes the methods that should be allowed in a specific context: within a component, an action creator, or a store. It uses `dispatchr` under the hood and it provides an abstraction for your application to share some of the boilerplate you saw between the server and the client. Let's turn this into a Fluxible app.

We'll start by creating an `app.js` file that will contain all of the common application setup code:

```js
// app.js
var Fluxible = require('fluxible');
var app = new Fluxible({
    component: ChatComponent
});
app.registerStore(MessageStore);
module.exports = app;
```

Now on the server we can use the `createContext` method to create a request scoped context:

```js
var express = require('express');
var showMessages = require('./actions/showMessages');
var server = express();

// get the fluxible instance
var app = require('./app');

server.get('/', function (req, res, next) {
    // create a request context
    var context = app.createContext();

    context.executeAction(showMessages, {}, function () {
        var html = React.renderToString(ChatComponent({
            // give components a component interface into the context
            context: context.getComponentContext()
        }));
        res.send(html);
    });
});

server.listen(process.env.PORT, 3000)
```

The action creator now receives an `actionContext` instead of the dispatcher directly. This `actionContext` provides the `dispatch` method, but not direct access to the dispatcher instance:

```js
var superagent = require('superagent');
module.exports = function showMessages(actionContext, payload, done) {
    superagent
        .get('http://yahoo.com/api/ChatExampleData.json')
        .set('Accept', 'application/json')
        .end(function (res) {
            var messages = JSON.stringify(res.body);
            actionContext.dispatch('RECEIVE_MESSAGES', messages);
            done();
        });
};
```

The component now receives the component context via React's context. This context has access to an `executeAction` method that will execute an action creator. There is also a mixin to reduce some boilerplate for listening to stores and having to pass the context around:

```js
// components/Chat.jsx
var readMessage = require('./action/readMessage');
var MessagesStore = require('./stores/MessageStore');
var MessageSection = React.createClass({
    mixins: [require('fluxible').Mixin],
    statics: {
        storeListeners: [MessageStore]
    },
    getInitialState: function() {
        var messageStore = this.getStore(MessageStore);
        return {
            messages: messageStore.getAllMessages()
        };
    },
    onClick: function (e) {
        this.executeAction(readMessage, {/*payload*/});
    },
    onChange: function () {
        this.setState(this.getInitialState());
    }
    render: function() {
        var messageListItems = this.state.messages.map(/*...*/);
        //...
    }

});

module.exports = MessageSection;
```

Internally, `executeAction` passes the `actionContext` to the action creators even though it's being called from the `componentContext`.

## Conclusion

React and Flux provide a very clean way to write applications and with a few alterations we can make it work for both server and client rendering. There are still a lot of features to think about, but we're extremely happy with the way our Flux applications are coming together.

- [Michael Ridgway](https://twitter.com/theridgway)
