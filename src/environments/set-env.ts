const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;
  // Configure Angular `environment.ts` file path
  const targetPath = './src/environments/environment.ts';
  // Load node modules
  const appVersion = require('../../package.json').version;
  require('dotenv').config({
    path: 'src/environments/.env',
  });
  // `environment.ts` file structure
  const envConfigFile = `export const environment = {
    api_url: '${process.env['API_URL']}',
    api_chat_url: '${process.env['API_CHAT_URL']}',
    encryption_key: '${process.env['ENCRYPTION_KEY']}',
    production: false,
    version: "1.0.1"
  };
  `;
  //WRITE FILE
  writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(
        `Angular environment.ts file generated correctly at ${targetPath} \n`
      );
    }
  });
};

setEnv();
