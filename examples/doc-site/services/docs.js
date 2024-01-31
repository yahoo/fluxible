/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import async from 'async';
import debugLib from 'debug';
import getSearchIndexPath from '../utils/getSearchIndexPath';
import highlight from 'highlight.js';
import lunr from 'lunr';
import marked from 'marked';
import qs from 'querystring';
import renderer from './../utils/renderer';
import request from 'superagent';
import routes from '../configs/routes';
import secrets from './../secrets';
import url from 'url';

const ENV = process.env.NODE_ENV;
const debug = debugLib('DocsService');
const indexDb = getSearchIndexPath();

marked.setOptions({
    highlight: (code) => {
        return highlight.highlightAuto(code).value;
    },
});

if (secrets.github.accessToken) {
    console.log('All good! Found access token.');
} else {
    console.error(
        'Not good! Missing access token. Will be rate-limited by github API.',
    );
}

// Generate a hash of valid api routes, from the /configs/apis.js file
let cache = {};
let documents = {};

// setup lunr index
const index = lunr(function () {
    debug('Creating lunr index');
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('description', { boost: 5 });
    this.field('body');
    this.field('permalink');
});

/**
 * Generic function to call GitHub's 'repos' API
 * https://developer.github.com/v3/repos/
 *
 * @function fetchGitHubReposApi
 * @param {Object} params
 * @param {String} [params.repo=yahoo/fluxible] Repository
 * @param {String} params.type Type of data to fetch
 * @param {Function} cb Request callback function handler
 * @async
 */
function fetchGitHubReposApi(params, cb) {
    const repo = params.repo || 'yahoo/fluxible';
    const type = params.type;

    // create github api url
    let githubUrl = 'https://api.github.com/repos/' + repo + '/' + type + '?';

    // the name of the commit/branch/tag
    if (params.ref) {
        githubUrl += '&ref=' + params.ref;
    }
    debug(githubUrl);

    if (secrets.github.accessToken) {
        request
            .get(githubUrl)
            .set('User-Agent', 'superagent')
            .set('Authorization', 'token ' + secrets.github.accessToken)
            .end(cb);
    } else {
        // still make call to github API, but will be rate limited.
        request.get(githubUrl).set('User-Agent', 'superagent').end(cb);
    }
}

/**
 * Gets the API docs content for fluxible repositories. Runs on an interval
 * to auto update the docs.
 *
 * @function fetchAPI
 * @param {Object} docParams Properties from route config
 * @param {Function} cb Async callback function
 * @async
 */
function fetchAPI(docParams, cb) {
    const title = docParams.pageTitlePrefix || docParams.pageTitle;
    const description = docParams.pageDescription;
    const githubRepo = docParams.githubRepo || 'yahoo/fluxible';
    const githubPath = docParams.githubPath;
    const githubRef = docParams.githubRef;
    const key = docParams.name;

    function fetchCallback(err, res) {
        if (err) {
            return cb(err);
        }

        let md = res.body && res.body.content; // base64 encoded string of the markdown file

        if (md) {
            let mdString = new Buffer(md, 'base64').toString(); // base64 decode

            let output = marked(mdString, { renderer: renderer });

            // Replace all .md links
            let linkRegex = /href="([^"]+\.md)(:?#[^"]+)?"/g;
            let replacements = [];
            let result;

            while ((result = linkRegex.exec(output)) !== null) {
                // Get the relative github path to link
                let fixedRelativePath = url.resolve(githubPath, result[1]);
                let matchedDoc;

                // Reverse lookup in routes file
                /*jshint ignore:start */
                Object.keys(routes).forEach((routeName) => {
                    let routeConfig = routes[routeName];

                    if (
                        fixedRelativePath === routeConfig.githubPath ||
                        // support absolute urls of links from different repositories
                        (result[1].indexOf('http') !== -1 &&
                            -1 !==
                                result[1].indexOf(
                                    `/${routeConfig.githubRepo}/blob/${githubRef}${routeConfig.githubPath}`,
                                ))
                    ) {
                        matchedDoc = routeConfig;
                        return;
                    }
                });

                /*jshint ignore:end*/
                if (!matchedDoc) {
                    if ('production' !== ENV) {
                        console.log(
                            githubRepo +
                                ':' +
                                githubPath +
                                ' has a broken ' +
                                'link to ' +
                                fixedRelativePath,
                        );
                    }
                    continue;
                }

                replacements.push([result[1], matchedDoc.path]);
                matchedDoc = null;
            }
            replacements.forEach(function (replacement) {
                output = output.replace(replacement[0], replacement[1]);
            });

            cache[key] = {
                key: key,
                content: output,
            };

            // index document for searching
            debug('Adding %s to index', githubPath);
            const document = {
                id: githubRepo + ':' + githubPath,
                title: title,
                body: output,
                description: description,
                permalink: docParams.path,
            };
            index.update(document);
            documents[document.id] = document;

            return cb(null, cache[key]);
        } else {
            console.error(
                'Doc not found for',
                githubRepo,
                githubPath,
                res.body,
            );

            cache[key] = {
                key: key,
                content: marked('# Doc Not Found: ' + key, {
                    renderer: renderer,
                }),
            };

            return cb(null, cache[key]);
        }
    }

    fetchGitHubReposApi(
        {
            repo: githubRepo,
            type: 'contents/' + githubPath,
            ref: githubRef,
        },
        fetchCallback,
    );
}

/**
 * Fetches the npm version for the package given. Then uses that version
 * to check for matching branches in the libs repo. If found, the branch
 * is returned otherwise, defaults to `master`.
 *
 * @function fetchGitBranch
 * @param {String} pkg NPM package name
 * @param {Function} cb Async callback
 * @async
 */
function fetchGitBranch(pkg, cb) {
    // TODO: Remove this when we figure out strategy for monorepo
    cb(null, 'master');
    return;
}

/**
 * Gets the API docs content for fluxible repositories. Runs on an interval
 * to auto update the docs.
 *
 * 1. Call npm API to return git branch for fluxible and fluxible-addons-react.
 * 2. Uses these versions to make GitHub API calls for docs content
 *
 * @function refreshCacheFromGithub
 */
(function refreshCacheFromGithub() {
    var repoList = Object.keys(routes)
        .map((routeName) => {
            return routes[routeName].githubRepo;
        })
        .filter((repo, index, self) => {
            return undefined !== repo && self.indexOf(repo) === index;
        });

    var branchHash = repoList.reduce((hash, repo) => {
        return {
            ...hash,
            [repo]: null,
        };
    }, {});

    Promise.all(
        repoList.map((repo) => {
            return new Promise((resolve, reject) => {
                fetchGitBranch(repo.split('/')[1], (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    branchHash[repo] = result;
                    resolve(result);
                });
            });
        }, {}),
    )
        .then(() => {
            const fetches = [];
            Object.keys(routes).forEach(function eachRoute(routeName) {
                let routeConfig = {
                    ...routes[routeName],
                    // pass branch name to pull specific branch from github
                    githubRef: branchHash[routes[routeName].githubRepo],
                };

                if (routeConfig.githubPath) {
                    fetches.push(function eachTask(cb) {
                        fetchAPI(routeConfig, cb);
                    });
                }
            });

            async.parallel(fetches, function npmFetchesCallback(err) {
                if (err) {
                    return console.error(err);
                }
            });
        })
        .catch();

    setTimeout(refreshCacheFromGithub, 6 * 60 * 60 * 1000); // refresh cache every six hours
})();

export default {
    name: 'docs',
    read: function (req, resource, doc, config, callback) {
        // Return immediately if repo's readme is in cache
        var cachedDoc = cache[doc.name];
        if (cachedDoc) {
            return callback(null, cachedDoc);
        } else {
            return fetchAPI(doc, callback);
        }
    },
};

export function getLunrIndex() {
    return index;
}

export function getDocuments() {
    return documents;
}
