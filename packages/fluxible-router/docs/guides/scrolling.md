# Scroll Position Management

[`handleHistory`](../api/handleHistory.md) has a built-in mechanism for managing scroll position upon page navigation, for modern browsers that support native history state:

* reset scroll position to `(0, 0)` when user clicks on a link and navigates to a new page, and
* restore scroll position to last visited state when user clicks forward and back buttons to navigate between pages.

If you want to disable this behavior, you can set `enableScroll` option to `false` for [`handleHistory`](../api/handleHistory.md):

```js
Application = handleHistory(Application, {
    enableScroll: false
});
```
