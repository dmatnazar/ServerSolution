const { ExecQueryGetRows, LoadQuery, ResSend, CheckObjForEmpty, CheckObjOrArrForNull } =  require('../../../Common/functions.js');
const { GetConnPool } =  require('../../../Common/mssql.js');
const { httpSts } =  require('../../../Common/static.js');
const fs = require('fs').promises; // Asinhron faýl okamak üçin
const path = require('path');
const { rows } = require('mssql');

const GetContactsQuery = LoadQuery ('GetContactsQuery' , 'Generals')
const GetFirmDataQueryDefault = LoadQuery ('GetFirmDataQueryDefault' , 'Generals')
const GetFirmDataQueryHosting = LoadQuery ('GetFirmDataQueryHosting' , 'Generals')
const GetCheckSumsQuery = LoadQuery('GetCheckSumsQuery', 'Generals');
const GetOptionsQuery = LoadQuery('GetOptionsQuery', 'Generals');
const GetPartnersQueryDefault = LoadQuery('GetPartnersQueryDefault', 'Generals');
const GetPartnersQueryHosting = LoadQuery('GetPartnersQueryHosting', 'Generals');
const GetRestrictionSettingsQuery = LoadQuery('GetRestrictionSettingsQuery', 'Generals');
const GetRoutePlansMainQuery = LoadQuery('GetRoutePlansMainQuery', 'Generals');
const GetRouteDetailsQuery = LoadQuery('GetRouteDetailsQuery', 'Generals');
const GetRoutePartnersQuery = LoadQuery('GetRoutePartnersQuery', 'Generals');
const GetSalesmansQuery = LoadQuery('GetSalesmansQuery', 'Generals');
const GetUsingTargetPlansQuery = LoadQuery('GetUsingTargetPlansQuery', 'Generals');
const GetStatusesQuery = LoadQuery ('GetStatusesQuery' , 'Generals')



const GetOptions = async (req, res) => {
    const query = await LoadQuery('GetOptionsQuery', 'Generals');
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
            ? await LoadQuery('GetFirmDataQueryHosting', 'Generals')
            : await LoadQuery('GetFirmDataQueryDefault', 'Generals');

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
      ? await LoadQuery('GetPartnersQueryHosting', 'Generals')
      : await LoadQuery('GetPartnersQueryDefault', 'Generals');

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
    const query = await LoadQuery('GetSalesmansQuery', 'Generals');
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
    const query = await LoadQuery('GetUsingTargetPlansQuery', 'Generals');
    try {
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetRestrictionSettings = async(req, res) =>
{   
    const query = await LoadQuery('GetRestrictionSettingsQuery', 'Generals');

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
            let query = GetContactsQuery(operand, guid);
            let rows = await ExecQueryGetRows(query);
            ResSend(res, httpSts.Success, null, rows);
        } catch (err) {
            ResSend(res, httpSts.ServerError, null, `${err}`);
        }
    } else {
        ResSend(res, httpSts.BadRequest, `Request body is empty! params[operand, guid]`, null);
    }
};

const GetStatuses = async (req, res) =>
{
    const query = await LoadQuery('GetStatusesQuery', 'Generals');
    try
    {
        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const GetCheckSums = async (req, res) => {
    const query = await LoadQuery('GetCheckSumsQuery', 'Generals');
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