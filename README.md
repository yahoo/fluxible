# Fluxible ![Build Status](https://github.com/yahoo/fluxible/actions/workflows/node.js.yml/badge.svg)

This repository is the home of Fluxible and related libraries.

For support, please use [GitHub Discussions](https://github.com/yahoo/fluxible/discussions).

## Documentation

Please check out the Fluxible package [README](https://github.com/yahoo/fluxible/blob/main/packages/fluxible/README.md) for documentation.

## Development

All code is developed against the latest Node LTS version. This repository leverages [npm workspaces][] for package management.

## Publishing

The [changesets] library publishes packages to the npm registry. Use the following steps to publish a package:

1. After making changes to a package in your branch, run `npx changesets` and follow the prompts to choose which package needs to be published and what type of version (i.e., `major`, `minor`, `patch`).
1. Commit the newly created `.changes/<id>.md` file to your branch.
1. Open a PR with your changes.
1. Once reviewed and merged, the GitHub Actions `publish` job will run the `changesets` action and open a new PR with `package.json` and `CHANGELOG.md` changes for the packages chosen to publish.
1. Merge this PR when a release is needed.

## License

This software is free to use under the Yahoo Inc. BSD license.
See the [LICENSE file] for license text and copyright information.

[changesets]: https://github.com/changesets/changesets
[LICENSE file]: https://github.com/yahoo/fluxible/blob/master/LICENSE.md
[npm workspaces]: https://docs.npmjs.com/cli/v7/using-npm/workspaces
