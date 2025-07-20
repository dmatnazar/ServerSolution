const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv)
console.log('Environment variables loaded:', myEnv);

const prcEnv = {
  backend_address: process.env.backend_address,
  backend_port: process.env.backend_port,
  backend_version: process.env.backend_version,
  host: process.env.backend_address + ":" + process.env.backend_port,

  // socket_host: process.env.socket_host,
  // socket_port: process.env.socket_port,

  db_host: process.env.db_host,
  db_port: process.env.db_port,
  db_name: process.env.db_name,
  db_username: process.env.db_username,
  db_password: process.env.db_password,
  admin_pass: process.env.admin_pass

  // ecomm_backend_port: process.env.ecomm_backend_port,

  // ecom_db_host: process.env.ecom_db_host,
  // ecom_db_port: process.env.ecom_db_port,
  // ecom_db_name: process.env.ecom_db_name,
  // ecom_db_username: process.env.ecom_db_username,
  // ecom_db_password: process.env.ecom_db_password,

  // ecom_remote_db_host: process.env.ecom_remote_db_host,
  // ecom_remote_db_port: process.env.ecom_remote_db_port,
  // ecom_remote_db_name: process.env.ecom_remote_db_name,
  // ecom_remote_db_username: process.env.ecom_remote_db_username,
  // ecom_remote_db_password: process.env.ecom_remote_db_password
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

module.exports = 
{
  prcEnv,
  httpSts
}