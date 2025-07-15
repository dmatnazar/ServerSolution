const sharp = require('sharp');
const { ExecQueryGetRows, ResSend, CheckObjForEmpty } =  require('../../../Common/functions.js');
const { GetConnPool } =  require('../../../Common/mssql.js');
const { httpSts } =  require('../../../Common/static.js');
const { GetAllMaterialsQuery, GetAllMaterialsHostingQuery } = require('../../../Queries/Materials/GetAllMaterialsQuery.js');
const { GetMaterialPricesQuery } = require('../../../Queries/Materials/GetMaterialPricesQuery.js');
const { GetUnitsQuery, GetUnitDetailsQuery } = require('../../../Queries/Materials/GetMaterialUnitsQuery.js');
const { GetMaterialsImgIDQuery } = require('../../../Queries/Materials/GetMaterialsImgIDQuery.js');
const { GetMaterialImageQuery } = require('../../../Queries/Materials/GetMaterialImageQuery.js');
const { GetUnitsAndDetailsQuery, GetUnitsDetailsQuery } = require('../../../Queries/Materials/GetUnitAndDetailsQuery.js');
const { GetGroupsQuery } = require('../../../Queries/Materials/GetGroupsQuery.js');
const { GetAttributesQuery} = require('../../../Queries/Materials/GetAttributesQuery.js');
const { GetMtrlAttrUnitQuery } = require('../../../Queries/Materials/GetMtrlAttrUnitQuery.js');
const { GetCurrencyQuery, GetPrTypesQuery} = require('../../../Queries/Materials/GetCurrencyAndPrTypesQuery.js');
const { GetLastPricesQuery } = require('../../../Queries/Materials/GetLastPricesQuery.js');
const { GetBarcodesQuery } = require('../../../Queries/Materials/GetBarcodesQuery.js');

const GetAllMaterials = async (req, res) => {
    try {
        let isHosting = req.query['is_hosting'];
        let query = CheckObjForEmpty(isHosting) 
            ? GetAllMaterialsHostingQuery() 
            : GetAllMaterialsQuery();

        let rows = await ExecQueryGetRows(query);

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
        let rows = await ExecQueryGetRows(GetMaterialPricesQuery);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetMaterialUnits = async (req, res) => {
    try {
        const sqlConnPool = await GetConnPool();
        let request = await sqlConnPool.request();

        const unitResult = await request.query(GetUnitsQuery());
        const unitDetResult = await request.query(GetUnitDetailsQuery());

        const obj = {
            tbl_units: unitResult.recordset,
            tbl_unit_details: unitDetResult.recordset
        };

        ResSend(res, httpSts.Success, null, obj);
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetMaterialsImgID = async(req, res) =>
{
    try
    {
        let rows = await ExecQueryGetRows(GetMaterialsImgIDQuery);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err)
    {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetMaterialImage = async(req, res) =>
{
    try
    {
        let image_id = req.query['image_id'];

        if(CheckObjForEmpty(image_id))
        {
            let query = GetMaterialImageQuery(image_id);

            const sqlConnPool = await GetConnPool();
            let result = await sqlConnPool.request().query(query);

            let obj = result['recordset'][0]['image_pict']; // > 200 KB
            let imageSize = result['recordset'][0]['image_size'];
            let imageBuffer = Buffer.from(obj, 'binary');

            if(imageSize > 10000){
                imageBuffer = await sharp(imageBuffer).resize({
                    width: null,
                    height: 200,
                    fit: 'cover'
                }).toBuffer();
            }

            res.status(httpSts.Success).send(imageBuffer);
        }
        else
            ResSend(res, httpSts.ServerError, 'Get request params is empty!');

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetUnitAndDetails = async (req, res) => {
    try {
        const sqlConnPool = await GetConnPool();
        let request = await sqlConnPool.request();

        let res_units = await request.query(GetUnitsAndDetailsQuery());
        let res_details = await request.query(GetUnitsDetailsQuery());

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
        let rows = await ExecQueryGetRows(GetGroupsQuery);
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
        let rows = await ExecQueryGetRows(GetAttributesQuery);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

const GetMtrlAttrUnit = async(req, res) =>
{
    try
    {
        let rows = await ExecQueryGetRows(GetMtrlAttrUnitQuery);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

const GetCurrencyAndPrTypes = async(req, res) =>
{
    try
    {
        const sqlConnPool = await GetConnPool();
        let request = await sqlConnPool.request();

        let res_currency = await request.query(GetCurrencyQuery);

        //--------------------------------------------------------------------------------

        let res_pr_types = await request.query(GetPrTypesQuery);

        let currency_rows = res_currency['recordset'];
        let pr_types_rows = res_pr_types['recordset'];

        let object = { 'currencies' : currency_rows, 'price_types' : pr_types_rows};
        ResSend(res, httpSts.Success, null, object);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${ err }`);
    }
}

const GetLastPrices = async(req, res) =>
{
    try
    {
        let rows = await ExecQueryGetRows(GetLastPricesQuery);
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
        let rows = await ExecQueryGetRows(GetBarcodesQuery);
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