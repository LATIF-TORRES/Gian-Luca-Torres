// Extends app.json. Only used to inject a base path for GitHub Pages, where the site
// is served from a subpath (https://<user>.github.io/<repo>/) instead of a domain root.
// GH_PAGES_BASE_URL is only set by the GitHub Actions web-deploy workflow, so local dev
// and the native iOS/Android builds are completely unaffected.
module.exports = ({ config }) => {
  if (process.env.GH_PAGES_BASE_URL) {
    config.experiments = {
      ...(config.experiments ?? {}),
      baseUrl: process.env.GH_PAGES_BASE_URL,
    };
  }
  return config;
};
