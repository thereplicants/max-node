const maxApi = require('max-api');

(async () => {
  try {
    const { setup } = await import('./index.mjs');
    setup(maxApi);
  } catch (e) {
    throw Error(e);
  }
})();
