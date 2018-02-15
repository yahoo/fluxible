/**
 * This is a sample file for your Github client id and client secret
 * This is needed to collect the doc's from the fluxible repo.
 * You can generate the client/secret pair here: https://github.com/settings/applications/new
 *
 * Alternatively, you can pass in an oauth access token to work around the rate limiting
 * restrictions of the client id / secret pair
 *
 * GitHub Auth docs: https://developer.github.com/v3/#authentication
 */
export default {
    github: {
        accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || ''
    }
};
