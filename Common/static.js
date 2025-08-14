const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('path');
const os = require('os')
const externalEnvPath = path.join(os.homedir(), 'AppData', 'Local', 'ServerSolution', 'connections', 'ServerSolutionDefault' , '.env');

const myEnv = dotenv.config({ path: externalEnvPath });
dotenvExpand.expand(myEnv);

console.log('Environment variables loaded from:', externalEnvPath);

const prcEnv = {
  backend_address: process.env.backend_address || '192.168.0.10',
  backend_port: process.env.backend_port || '2002',
  backend_version: process.env.backend_version || 'v1',
  host: (process.env.backend_address && process.env.backend_port) 
    ? `${process.env.backend_address}:${process.env.backend_port}` 
    : 'default_host',
  db_host: process.env.db_host || 'localhost',
  db_port: process.env.db_port || '1433',
  db_name: process.env.db_name || '',
  db_username: process.env.db_username || 'sa',
  db_password: process.env.db_password || 'Server123456',
  admin_pass: process.env.admin_pass || 'admin1001',
};

const httpSts = {
  Success: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  UnAuthorized: 401,
  NotFound: 404,
  ServerError: 500,
};

module.exports = {
  prcEnv,
  httpSts
};
