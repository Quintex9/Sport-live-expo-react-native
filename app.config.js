export default ({ config }) => ({
  ...config,
  extra: {
    APISPORTS_KEY: process.env.APISPORTS_KEY,
  },
  "plugins": [
    "expo-router"
  ]
});
