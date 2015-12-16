# API: `handleHistory`

The `handleHistory` higher-order component handles the browser history state management.

## Options

| Option | Default | Description |
|:-------|:--------|:------------|
| `checkRouteOnPageLoad` | `false` | Performs navigate on first page load |
| `enableScroll` | `true` | Saves scroll position in history state |
| `historyCreator` | [`History`](../../lib/History.js) | A factory for creating the history implementation |

## Example Usage

```js
// components/App.jsx
var provideContext = require('fluxible').provideContext;
var handleHistory = require('fluxible-router').handleHistory;
var NavLink = require('fluxible-router').NavLink;

var AppComponent = React.createClass({
    render: function () {
        // Get the handler from the current route which is passed in as prop
        var Handler = this.props.currentRoute.handler;

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

### Decorator Usage

```js
// components/App.jsx
import {provideContext} from 'fluxible-addons-react';
import {handleHistory} from 'fluxible-router';

@provideContext
@handleHistory
class AppComponent extends React.Component {
    //...
}

export default AppComponent;
```

## onbeforeunload Support

The `History` API does not allow `popstate` events to be cancelled, which results in `window.onbeforeunload()` methods not being triggered.  This is problematic for users, since application state could be lost when they navigate to a certain page without knowing the consequences.

Our solution is to check for a `window.onbeforeunload()` method, prompt the user with `window.confirm()`, and then navigate to the correct route based on the confirmation.  If a route is cancelled by the user, we reset the page URL back to the original URL by using  the `History` `pushState()` method.

To implement the `window.onbeforeunload()` method, you need to set it within the components that need user verification before leaving a page.  Here is an example:

```javascript
componentDidMount: function() {
  window.onbeforeunload = function () {
    return 'Make sure to save your changes before leaving this page!';
  }
}
```
