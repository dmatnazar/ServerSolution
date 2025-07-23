const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('path');
const os = require('os');

const userHome = os.homedir();
const externalEnvPath = path.join('C:', 'ProgramData', 'ServerSolutionDefault', '.env');

const myEnv = dotenv.config({ path: externalEnvPath });
dotenvExpand.expand(myEnv);

console.log('Environment variables loaded from:', externalEnvPath);

const prcEnv = {
  backend_address: process.env.backend_address,
  backend_port: process.env.backend_port,
  backend_version: process.env.backend_version,
  host: process.env.backend_address + ":" + process.env.backend_port,

  db_host: process.env.db_host,
  db_port: process.env.db_port,
  db_name: process.env.db_name,
  db_username: process.env.db_username,
  db_password: process.env.db_password,
  admin_pass: process.env.admin_pass
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
