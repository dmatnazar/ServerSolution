const {
    ExecQueryGetRows, ResSend, CheckObjProps,
    CheckObjForEmpty, ConvertToSQLFormat, ReadQuery
} = require('../../../Common/functions.js');
const { httpSts } = require('../../../Common/static.js');

const GetSalesByMaterials = async (req, res) => {
    const data_obj = req.query;
    const props = ['dt_begin', 'dt_end', 'seller_id'];

    if (CheckObjProps(data_obj, props)) {
        try {
            let cond = `i.inv_date BETWEEN ${ConvertToSQLFormat(data_obj['dt_begin'])} 
                                          AND ${ConvertToSQLFormat(data_obj['dt_end'])}`;

            const seller_id = data_obj['seller_id'];
            if (CheckObjForEmpty(seller_id) && parseInt(seller_id) > 0)
                cond += ` AND i.salesman_id = '${seller_id}'`;

            // ✅ Query okujak
            const queryText = await ReadQuery('GetSalesByMaterialsQuery', 'Reports', [cond]);
            const rows = await ExecQueryGetRows(queryText);

            ResSend(res, httpSts.Success, null, rows);
        } catch (err) {
            console.error('GetSalesByMaterials ERROR:', err);
            ResSend(res, httpSts.ServerError, null, `${err}`);
        }
    } else {
        ResSend(res, httpSts.BadRequest, 'Get request params is empty!', null);
    }
};

module.exports = {
    GetSalesByMaterials
};