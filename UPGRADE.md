# Upgrade Guide

## `0.5.0-alpha.1`

### React addons moved to fluxible-addons-react

The React addons have been broken out into a separate package called [fluxible-addons-react](https://github.com/yahoo/fluxible-addons-react). This was done to faciliate the use of Fluxible with other view libraries like React Native.

Your application should depend on `fluxible-addons-react` directly and require the addons from that package.
