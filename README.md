# Fluxible

This repository is the home of [Fluxible](http://fluxible.io/) and related libraries.

Join the #fluxible channel of the [Reactiflux](http://reactiflux.com) Discord community.

## Development

Development is currently being done against Node 4/5.

Releases can be done with the following steps:

```js
> gulp version -p <packageName> -v <patch|minor|major>
manually update CHANGELOG.md in the <packageName>
> git push origin master
> git push origin <tag>
> gulp publish -p <packageName>
```

## License

This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
