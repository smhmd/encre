import {} from 'vitepress/dist/client';
// TODO wait for vitepress update
export default {
  Layout: theme.Layout,
  NotFound: theme.NotFound, // <- this is a Vue 3 functional component
  enhanceApp({ app, router, siteData }) {
    // app is the Vue 3 app instance from createApp()
    // router is VitePress' custom router (see `lib/app/router.js`)
    // siteData is a ref of current site-level metadata.
  },
};
