/**
 * This is a sample file for using your Github access token to collect
 * the doc's from the fluxible repo.
 *
 * GitHub Auth docs: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#authentication
 */
export default {
    github: {
        accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
    },
};
