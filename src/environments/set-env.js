const fs = require('fs');

const envConfig = `
export const environment = {
  api_url: '${process.env.API_URL}',
  api_chat_url: '${process.env.API_CHAT_URL}',
  encryption_key: '${process.env.ENCRYPTION_KEY}',
  production: ${process.env.PRODUCTION === 'true'},
  version: "${process.env.VERSION}"
};
`;

fs.writeFileSync('./src/environments/environment.prod.ts', envConfig);
console.log('✅ environment.prod.ts updated successfully');
