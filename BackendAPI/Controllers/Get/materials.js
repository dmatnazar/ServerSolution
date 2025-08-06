const sharp = require('sharp');
const { ExecQueryGetRows, ResSend, LoadQuery, CheckObjForEmpty } =  require('../../../Common/functions.js');
const { GetConnPool } =  require('../../../Common/mssql.js');
const { httpSts } =  require('../../../Common/static.js');

const GetAllMaterials = async (req, res) => {
    try {
        let isHosting = req.query['is_hosting'];
        let query = CheckObjForEmpty(isHosting) 
            ? await LoadQuery('GetAllMaterialsHostingQuery' , 'Materials')
            : await LoadQuery('GetAllMaterialsQuery' , 'Materials');

        let rows = await ExecQueryGetRows(query);
        // console.log("rows", rows);
        // handle discount field only for normal query (not hosting)
        if (rows.length !== 0 && !isHosting) {
            rows.forEach(row => {
                if (!row.mtrl_disc_active || row.mtrl_disc_active.length < 1) {
                    row.mtrl_disc_active = 0;
                }
            });
        }

        ResSend(res, httpSts.Success, null, rows);
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetMaterialPrices = async(req, res) =>
{
    try
    {
        const query = await LoadQuery('GetMaterialPricesQuery', 'Materials');
        const rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetMaterialUnits = async (req, res) => {
    try {
        const sqlConnPool = await GetConnPool();
        const request = sqlConnPool.request();

        const unitsQuery = await LoadQuery('UnitsList', 'Materials');
        const unitDetailsQuery = await LoadQuery('UnitDetailsBasic', 'Materials');

        const unitResult = await request.query(unitsQuery);
        const unitDetResult = await request.query(unitDetailsQuery);

        const obj = {
            tbl_units: unitResult.recordset,
            tbl_unit_details: unitDetResult.recordset
        };

        ResSend(res, httpSts.Success, null, obj);
    } catch (err) {
        console.error('GetMaterialUnits ERROR:', err);
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};


const GetMaterialsImgID = async(req, res) =>
{
    try
    {
        const query = await LoadQuery('GetMaterialsImgIDQuery', 'Materials');
        // console.log('Material_id -----------' , query)
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err)
    {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetMaterialImage = async (req, res) => {
    try {
        let image_id = req.query['image_id'];
        // console.log('image_id-------', image_id)
        if (CheckObjForEmpty(image_id)) {
            const query = await LoadQuery('GetMaterialImageQuery', 'Materials', [image_id]);
            // console.log('query------------' , query)
            const sqlConnPool = await GetConnPool();
            let result = await sqlConnPool.request().query(query);

            if (!result.recordset || result.recordset.length === 0) {
                return ResSend(res, httpSts.NotFound, 'Image not found');
            }

            let obj = result.recordset[0]['image_pict'];
            let imageSize = result.recordset[0]['image_size'];
            let imageBuffer = Buffer.from(obj, 'binary');

            if (imageSize > 10000) {
                imageBuffer = await sharp(imageBuffer)
                    .resize({
                        width: null,
                        height: 200,
                        fit: 'cover'
                    })
                    .toBuffer();
            }

            res.status(httpSts.Success).send(imageBuffer);
        } else {
            ResSend(res, httpSts.BadRequest, 'Missing image_id parameter! ');
        }

    } catch (err) {
        console.error('GetMaterialImage ERROR:', err);
        ResSend(res, httpSts.ServerError, 'Error fetching image', `${err}`);
    }
};

const GetUnitAndDetails = async (req, res) => {
    try {
        const sqlConnPool = await GetConnPool();
        let request = await sqlConnPool.request();

        const unitsQuery = await LoadQuery('UnitsWithGuid', 'Materials');
        const unitDetailsQuery = await LoadQuery('UnitDetailsWithQuery', 'Materials');


        let res_units = await request.query(unitsQuery);
        let res_details = await request.query(unitDetailsQuery);

        let unit_rows = res_units.recordset;
        let unit_det_rows = res_details.recordset;

        let object = {
            'units': unit_rows,
            'unit_details': unit_det_rows
        };

        ResSend(res, httpSts.Success, null, object);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetGroups = async(req, res) =>
{
    try
    {
        const query = await LoadQuery('GetGroupsQuery', 'Materials');
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err)
    {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

const GetAttributes = async(req, res) =>
{
    try
    {
        const query = await LoadQuery('GetAttributesQuery', 'Materials');
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

const GetMtrlAttrUnit = async(req, res) =>
{
    try
    {
        const query = await LoadQuery('GetMtrlAttrUnitQuery', 'Materials');
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

const GetCurrencyAndPrTypes = async (req, res) => {
    try {
        const sqlConnPool = await GetConnPool();
        let request = await sqlConnPool.request();

        // Load queries asynchronously
        const currencyQuery = await LoadQuery('GetCurrencyQuery', 'Materials');
        const prTypesQuery = await LoadQuery('GetPrTypesQuery', 'Materials');

        // Execute both queries
        let res_currency = await request.query(currencyQuery);
        let res_pr_types = await request.query(prTypesQuery);

        let currency_rows = res_currency['recordset'];
        let pr_types_rows = res_pr_types['recordset'];

        let object = {
            currencies: currency_rows,
            price_types: pr_types_rows
        };

        ResSend(res, httpSts.Success, null, object);

    } catch (err) {
        console.error('GetCurrencyAndPrTypes ERROR:', err);
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};


const GetLastPrices = async(req, res) =>
{
    try
    {
        const query = await LoadQuery('GetLastPricesQuery', 'Materials');
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err)
    {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

const GetBarcodes = async(req, res) =>
{
    try
    {
        const query = await LoadQuery('GetBarcodesQuery', 'Materials');
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err)
    {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

module.exports =
{
    GetAllMaterials,
    GetMaterialImage,
    GetMaterialUnits,
    GetMaterialPrices,
    GetMaterialsImgID,
    GetUnitAndDetails,
    GetGroups,
    GetAttributes,
    GetMtrlAttrUnit,
    GetCurrencyAndPrTypes,
    GetLastPrices,
    GetBarcodes
}