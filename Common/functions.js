const axios = require('axios')
const ping = require("ping");
const sql = require('mssql');
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const fsPromise = require('fs/promises')
const sharp = require('sharp')
const { app } = require('electron')

const { GetConnPool } = require('../Common/mssql.js');
const { httpSts, prcEnv } = require('../Common/static.js');
const projectRoot = path.resolve(__dirname, '..');

async function ExecQueryGetRows(query) {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.error('[ExecQueryGetRows] Error: Query does not exist or is empty!');
      return null;
    }

    const sqlConnPool = await GetConnPool();
    const result = await sqlConnPool.request().query(query);

    if (!result || !result.recordset) {
      console.warn('[ExecQueryGetRows] The result is empty or undefined.');
      return null;
    }

    return result.recordset;
  } catch (err) {
    console.error('[ExecQueryGetRows] SQL execution error:', err);
    return null;
  }
}

async function ExecQueryGetValue(query, field) {
  const sqlConnPool = await GetConnPool();
  const result = await sqlConnPool.request().query(query);
  const obj = result['recordset'][0];
  return obj[field].toString();
}

//======================================================================1

async function SendPing(host) {
  return await ping.promise.probe(host,
    {
      timeout: 10
    });
}

//======================================================================2

function ResSend(res, http_sts, text, get_obj) {
  const object = JSON.stringify(get_obj);
  //console.log(http_sts, object, '\n');

  res.status(http_sts)
    .send(`${CheckObjForNull(text)}${CheckObjForNull(object)}`);
}

//======================================================================3

function CheckObjForNull(object) {
  return `${object}` !== "null" ? object : "";
}

//======================================================================4

function CheckObjOrArrForNull(obj_or_arr) {
  if (obj_or_arr !== null && obj_or_arr !== undefined) {
    if (obj_or_arr instanceof Object && Object.keys(obj_or_arr).length !== 0)
      return true;
    else if (Array.isArray(obj_or_arr) && obj_or_arr.length !== 0)
      return true;
  }
  return false;
}

//======================================================================5

function CheckObjProps(object, props) {
  return props.every((prop) => object.hasOwnProperty(prop));
}

//======================================================================6

const CheckResObjKey = (object) => {
  if (object !== undefined)
    return (
      Object.keys(object).length === 4 ||
      object.output !== undefined ||
      object.recordset !== undefined
    );
  return false;
};

//======================================================================7

function CheckObjForEmpty(object) {
  if (object !== undefined && object.length > 0)
    return true;
  return false;
}

//======================================================================8

function ConvertToSQLFormat(get_date) {
  let date = ConvertToDate(get_date);
  return `${date.toLocaleDateString('en-CA')}`;
}

//======================================================================9

function ConvertToDate(get_date) {
  let date = new Date(get_date);

  if (date.toString().startsWith('Invalid')) {
    let get_dt = get_date.toString();
    if (get_dt.includes('.')) {
      let [d, m, y] = get_dt.split(/\D/);
      date = new Date(y, m - 1, d);
    }
    else
      return undefined;
  }
  return date;
}

//=====================================================================10

function AddDayToDate(get_date) {
  var result = new Date(get_date);
  return result.setDate(result.getDate() + 1);
}

//=====================================================================11

const DoMatchingInDB = async (real_id, last_id, matching_type) => {
  let object = {};
  try {
    const sqlConnPool = await GetConnPool();

    console.log('real_id:', real_id, '; last_id:', last_id);

    await sqlConnPool.request()
      .input('last_id', sql.VarChar, last_id)
      .input('matching_type', sql.VarChar, matching_type)
      .query(`delete from tbl_br_matching where last_id=@last_id and
                                      matching_type=@matching_type`);

    object = await sqlConnPool.request()
      .input('real_id', sql.Int, real_id)
      .input('last_id', sql.VarChar, last_id)
      .input('matching_type', sql.VarChar, matching_type)
      .query(`insert into tbl_br_matching(real_id, last_id, matching_type)
                               values (@real_id, @last_id, @matching_type);
                                          select SCOPE_IDENTITY() as id;`);
  }
  catch (err) {
    object = `${err}`;
  }

  let result = CheckResObjKey(object);
  return { 'object': object, 'success': result };
}

//=====================================================================12

function MinsToMillSeconds(mins) {
  return (Number(mins) * 60) * 1000
}

//=====================================================================13

const axiosInstance = axios.create({
  baseURL: `http://${prcEnv.host}/${prcEnv.backend_version}`,
  timeout: 180 * 1000,
});

//=====================================================================14

const AxiosPost = async (cond_url, data, config = {}) => {
  return axiosInstance.post(cond_url, data, { ...config })
    .then(response => response.data)
    .catch(err => err);
}

//=====================================================================15

const AxiosGet = async (cond_url, config = {}) => {
  let { status, result } = await axiosInstance.get(cond_url, { ...config })
    .then(response => {
      return {
        status: response.status,
        result: response.data
      }
    })
    .catch(error => {
      return {
        status: error.status,
        result: error
      }
    });
  if (status !== httpSts.Success) {
    console.log('Error getting data from API: ', cond_url, '\n', result);
    result = false;
  }
  return result;
}

function ImageUploader() {
  const imageUploadPath = path.join(app.getPath('userData'), '/PhotoReports/')
  const originalImageUploadPath = imageUploadPath + 'Original'
  const storage = multer.diskStorage
    ({
      destination: function (req, file, cb) {
        if (!fs.existsSync(imageUploadPath)) {
          fs.mkdir(imageUploadPath, (err) => {
            if (err) {
              console.log('Photo Reports Folder creating error: ', err)
            }
            fs.mkdir(originalImageUploadPath, (err) => {
              if (err) {
                console.error(err)
              }
              cb(null, originalImageUploadPath)
            })
          })
        } else {
          cb(null, originalImageUploadPath)
        }
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname)
      },
    });

  const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'), false);
    }
  };

  return multer({ storage: storage, fileFilter: fileFilter, preservePath: true });
}

async function ImageCompress(image) {
  try {
    const imagePath = image.path.toString();
    const userDataPath = app.getPath('userData')
    const processedImagesPath = path.join(userDataPath, 'PhotoReports',
      'Compressed');

    sharp.cache(false)
    if (!fs.existsSync(processedImagesPath)) {
      await fsPromise.mkdir(processedImagesPath)
    }
    const fullImagePathInCompressed = path.join(processedImagesPath, image.filename)
    const metadata = await sharp(imagePath).metadata();
    const newSize = CalculateNewSize(metadata.width, metadata.height, 1258291); // 1,5 MB
    const buffer = await sharp(imagePath)
      .resize(newSize.width, newSize.height)
      .withMetadata()
      .toBuffer()
    await fsPromise.writeFile(fullImagePathInCompressed, buffer)
    // fs.rmSync(imagePath, { force: true })
    await fsPromise.unlink(imagePath)

    return buffer;
  } catch (err) {
    console.error('Error in ImageCompress:', err);
    return false;
  }
}

function CalculateNewSize(width, height, targetSize) {
  const aspectRatio = width / height;
  const newWidth = Math.sqrt(targetSize * aspectRatio);
  const newHeight = newWidth / aspectRatio;
  return { width: Math.floor(newWidth), height: Math.floor(newHeight) };
}


// For save query

const queryCache = {};

// 🔄 Esasy funksiýa: SQL faýlyny okaýar we cache ulanýar
async function LoadQuery(fileName, subFolder, params = [], forceReload = false) {
  const cacheKey = `${subFolder}/${fileName}`;

  if (!forceReload && queryCache[cacheKey]) {
    return processQuery(queryCache[cacheKey], params);
  }

  try {
    const baseQueryDir = path.join('C:', 'ProgramData', 'ServerSolutionDefault', 'Queries');
    const queryPath = path.join(baseQueryDir, subFolder, `${fileName}.sql`);
    const query = fs.readFileSync(queryPath, 'utf8');

    queryCache[cacheKey] = query;
    return processQuery(query, params);
  } catch (err) {
    throw new Error(`[loadQuery] Failed to read ${subFolder}/${fileName}.sql: ${err.message}`);
  }
}

// 🧹 Cache-den belli bir faýly aýyrýar
function InvalidateQueryCache(fileName, subFolder) {
  const cacheKey = `${subFolder}/${fileName}`;
  delete queryCache[cacheKey];
}

// 🔄 Ähli cache-i arassalaýar (isleseň)
function ClearAllQueryCache() {
  Object.keys(queryCache).forEach(key => delete queryCache[key]);
}

// Parametr bilen query-ni işleýän funksiýa (islegiňize görä düzediň)
function processQuery(query, params = []) {
  // Ýönekeý ýer tutujy bilen çalyşmak
  let processed = query;
  params.forEach((val, idx) => {
    processed = processed.replace(`$${idx + 1}`, val);
  });
  return processed;
}

 
module.exports = {
  ExecQueryGetRows,
  ExecQueryGetValue,
  SendPing, ResSend,
  CheckObjProps,
  CheckResObjKey,
  CheckObjForEmpty,
  CheckObjOrArrForNull,
  ConvertToSQLFormat,
  ConvertToDate,
  AddDayToDate,
  DoMatchingInDB,
  MinsToMillSeconds,
  AxiosPost, AxiosGet,
  ImageUploader,
  ImageCompress,
  LoadQuery,
  InvalidateQueryCache,
  ClearAllQueryCache,
};