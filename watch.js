const chokidar = require('chokidar');
const { utimesSync } = require('node:fs');

function touchFile() {
  utimesSync('./main.js', new Date(), new Date());
}

/** Save main.mjs (which is the only file Node for Max watches) when any
 * *.js or *.mjs file in the directory changes
 */
const watcher = chokidar.watch('./*.mjs');
watcher.on('all', () => {
  console.log('File change detected');
  touchFile();
});
