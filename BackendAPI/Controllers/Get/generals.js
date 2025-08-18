const { ExecQueryGetRows, LoadQuery, ResSend, CheckObjForEmpty, CheckObjOrArrForNull } =  require('../../../Common/functions.js');
const { GetConnPool } =  require('../../../Common/mssql.js');
const { httpSts } =  require('../../../Common/static.js');
const fs = require('fs').promises; // Asinhron faýl okamak üçin
const path = require('path');
const { rows } = require('mssql');


const GetOptions = async (req, res) => {
    const query = await LoadQuery('generals', 'options', 'GetOptionsQuery');
    try {
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetFirmData = async (req, res) => {
    try {
        let params = req.query['is_hosting'];

        // SQL soragy is hosting-e görä ýükleýäris
        let query = CheckObjForEmpty(params)
            ? await LoadQuery('generals', 'firm_data', 'GetFirmDataQueryHosting')
            : await LoadQuery('generals', 'firm_data', 'GetFirmDataQueryDefault');

        if (!query) {
            return ResSend(res, httpSts.ServerError, 'Query not found', null);
        }

        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
        console.error("Firm query error:", err);
    }
};

const GetFirmLogo = async(req, res) =>
{
    try
    {
        let field = req.query['field'];

        if(CheckObjForEmpty(field))
        {
            let query = `select ${ field } from tbl_mg_firm`;
            
            const sqlConnPool = await GetConnPool();
            let result = await sqlConnPool.request().query(query);

            let obj = result['recordset'][0][field];
            res.status(httpSts.Success).send(Buffer.from(obj, 'binary'));
        }
        else
            ResSend(res, httpSts.ServerError, 'Get request params is empty!');

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetPartners = async (req, res) => {
  try {
    let params = req.query['is_hosting'];
    // Asynchrondyr diýip hasaplaýarys
    const query = CheckObjForEmpty(params)
        ? await LoadQuery('generals', 'partners', 'GetPartnersQueryHosting')
        : await LoadQuery('generals', 'partners', 'GetPartnersQueryDefault');
    if (!query) {
      return ResSend(res, httpSts.ServerError, 'Query file not found', null);
    }

    const rows = await ExecQueryGetRows(query);
    ResSend(res, httpSts.Success, null, rows);

  } catch (err) {
    console.error('Query error:', err);
    ResSend(res, httpSts.ServerError, null, `${err}`);
  }
};

const GetSalesmans = async (req, res) => {
  try {
    const query = await LoadQuery('generals', 'salesmans', 'GetSalesmansQuery');
    if (!query) {
      return ResSend(res, httpSts.ServerError, 'Query not found', null);
    }
    const rows = await ExecQueryGetRows(query);
    ResSend(res, httpSts.Success, null, rows);
  } catch (err) {
    ResSend(res, httpSts.ServerError, null, `${err}`);
  }
};

const GetRoutePlans = async (req, res) => {
    try {
        const GetRoutePlansMainQuery =await LoadQuery('generals', 'route_plans', 'GetRoutePlansMainQuery');
        const GetRouteDetailsQuery = await LoadQuery('generals', 'route_plans', 'GetRouteDetailsQuery');
        const GetRoutePartnersQuery = await LoadQuery('generals', 'route_plans', 'GetRoutePartnersQuery');

        const sqlConnPool = await GetConnPool();
        let request = await sqlConnPool.request();

        let res_route_plans = await request.query(GetRoutePlansMainQuery);
        let res_route_details = await request.query(GetRouteDetailsQuery);
        let res_route_partners = await request.query(GetRoutePartnersQuery);

        let route_plans_rows = res_route_plans.recordset;
        let route_details_rows = res_route_details.recordset;
        let route_partners_rows = res_route_partners.recordset;

        let obj = {
            tbl_route_plans: route_plans_rows,
            tbl_route_details: route_details_rows,
            tbl_route_clients: route_partners_rows
        };

        ResSend(res, httpSts.Success, null, obj);
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetUsingTargetPlans = async (req, res) => {
    const query = await LoadQuery('generals', 'using_target', 'GetUsingTargetPlansQuery');
    try {
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetRestrictionSettings = async(req, res) =>
{   
    const query = await LoadQuery('generals', 'restr_settings', 'GetRestrictionSettingsQuery');
    try
    {
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}


const GetContacts = async (req, res) => {
    if (CheckObjOrArrForNull(req.query)) {
        try {
            const { operand, guid } = req.query;
            // operand we guid-i bir params massiwine birleşdirýäs
            const params = [operand, guid];
            const query = await LoadQuery('generals', 'contacts', 'GetContactsQuery', params);
            // console.log('SQL Query after replacement:', query); // Çalşylandan soňky soragy barlamak
            const rows = await ExecQueryGetRows(query);
            // console.log("GetContacts rows:", rows);
            ResSend(res, httpSts.Success, null, rows);
        } catch (err) {
            console.error('Ýalňyşlyk:', err);
            ResSend(res, httpSts.ServerError, null, `${err}`);
        }
    } else {
        ResSend(res, httpSts.BadRequest, `Request body is empty! params[operand, guid]`, null);
    }
};

const GetStatuses = async (req, res) =>
{
    const query = await LoadQuery('generals', 'statuses', 'GetStatusesQuery');
    try
    {
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetCheckSums = async (req, res) => {
    const query = await LoadQuery('generals', 'checksums', 'GetCheckSumsQuery');
    // console.log("GetCheckSums query:", query);
    try {
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}` + `\nQuery: ${query}`);
    }
};

module.exports = 
{
    GetOptions, GetFirmData, 
    GetFirmLogo, GetPartners, 
    GetSalesmans, GetRoutePlans,
    GetUsingTargetPlans,
    GetRestrictionSettings,
    GetContacts, GetStatuses,
    GetCheckSums
}