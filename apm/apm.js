const max = require('max-api');
const { readdir, readFile } = require('node:fs/promises');
const xml2js = require('xml2js');

async function main() {
  const fileName =
    '/Users/ward/Library/Preferences/Ableton/Live 11.1.6/Library.cfg';
  console.log('Loaded test.js main()');

  try {
    const configXml = await readFile(fileName);
    const config = await xml2js.parseStringPromise(configXml);
    const userLibraryPath = `${config.Ableton.ContentLibrary[0].UserLibrary[0].LibraryProject[0].ProjectPath[0]['$'].Value}/${config.Ableton.ContentLibrary[0].UserLibrary[0].LibraryProject[0].ProjectName[0]['$'].Value}`;
    max.outlet(userLibraryPath);
    const apmPath = `${userLibraryPath}/Ableton Package Manager`;
    const files = await readdir(apmPath, { withFileTypes: true });
    const folders = files
      .filter((file) => file.isDirectory())
      .map((folder) => folder.name);
    console.log(JSON.stringify(folders));
    max.outlet(['packages', ...folders]);

    // See if `PreferredFactoryPacksInstallationPath` is set
    // Otherwise, it should be at:
    // - Mac: /Users/[user]/Music/Ableton/Factory Packs
    // - Windows: \Users\[user]\Documents\Ableton\Factory Packs
  } catch (e) {
    console.error(e);
  }
}

main();
