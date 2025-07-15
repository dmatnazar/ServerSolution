const sql = require('mssql');
const { httpSts, prcEnv } = require("../Common/static.js");

const sqlConfig = {
    server: prcEnv.db_host,
    user: prcEnv.db_username,
    password: prcEnv.db_password,
    database: prcEnv.db_name,
    port: parseInt(prcEnv.db_port),
    pool: {
      max: 20,
      min: 0,
      idleTimeoutMillis: 60 * 1000,
    },
    options:{
        encrypt: false, // true for azure
        trustServerCertificate: false, // change to true for local dev / self-signed certs
        requestTimeout: 60 * 1000
    }
};

let sqlConnPool;

const GetConnPool = async () =>
{
  if (!sqlConnPool) {
    sqlConnPool = new sql.ConnectionPool(sqlConfig);
    await sqlConnPool.connect();
  }
  return sqlConnPool;
};

const TryConnToSql = async () =>
{
  var result = {};
  try
  {
    let pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect(); result.status = httpSts.Success;
    result.message = 'CONN_SUCCESS';//`Successfully connect to ${ sqlConfig?.database } database!`;
    
    if(pool.connected)
      pool.close();

  } catch (error)
  {
    result.status = httpSts.BadRequest;
    result.message = `Error connecting to database => ${ error }`;
  }
  return result;
};


const TryConnToServer = async (electron_sql_conn) => {
  var result = {};
  var config =
    Object.keys(electron_sql_conn).length !== 0 ? electron_sql_conn : sqlConfig;
  electron_sql_conn.pool = sqlConfig.pool;
  electron_sql_conn.options = sqlConfig.options;
  electron_sql_conn.encrypt = sqlConfig.encrypt;
  electron_sql_conn.requestTimeout = sqlConfig.requestTimeout;
  config.port = parseInt(config.port);
  const pool = new sql.ConnectionPool(config);
  try {
    await pool.connect();
    result.status = httpSts.Success;
    result.message = `Successfully connect to ${config?.database} database!`;
  } catch (error) {
    result.status = httpSts.BadRequest;
    result.message = `Error occred while connecting to database >> ${error}`;
  }
 
  return result;
};


module.exports =
{
  sqlConfig,
  GetConnPool,
  TryConnToSql,
  TryConnToServer
  
};