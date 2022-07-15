// const maxApi = require('max-api');
const maxApi = require('max-api');
maxApi.post(`Node version: ${process.versions.node}`);

(async () => {
  try {
    const { setup } = await import('./index.mjs');
    setup(maxApi);
  } catch (e) {
    throw Error(e);
  }
})();
