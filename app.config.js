export default ({ config }) => ({
  ...config,
  extra: {
    APISPORTS_KEY: process.env.APISPORTS_KEY,
  },
});
