# createNavLinkComponent

`createNavLinkComponent` is a function for you to create a NavLink component, you are able to pass options to overwrite attributes to generate the NavLink. e.g., custom mixin or click handler.

## Parameters

| Param Name | Param Type | Description |
|-----------|-----------|-------------|
| overwriteSpec | Object | the spec object taken to overwrite the default spec when we create NavLink using React.createClass |


## Example Usage

```js
var createNavLinkComponent = require('fluxible-router').createNavLinkComponent;

module.exports = createNavLinkComponent({
    displayName: 'CustomNavLink',
    mixins: [someMixin],
    clickHandler: function (e) {
        // custom click handler
        this.dispatchNavAction(e);
    }
});
```
