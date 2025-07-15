const str_format = require( '@stdlib/string-format' );

const { ExecQueryGetRows, ExecQueryGetValue, ResSend, CheckObjForEmpty,
        CheckObjProps } =  require('../../../Common/functions.js');
const { httpSts } =  require('../../../Common/static.js');
const { GetWarehousesQuery, GetWarehousesHostingQuery } = require('../../../Queries/Werehouses/GetWarehousesQuery.js');
const { GetExecuteSP, GetMainQuery, GetCalcOrdAmountQuery } = require('../../../Queries/Werehouses/GetStockByWhouseQuery.js');
const { GetPersonalStockQuery } = require('../../../Queries/Werehouses/GetPersonalStockQuery.js');

const GetWarehouses = async (req, res) => {
    try {
        let params = req.query['is_hosting'];
        let query = CheckObjForEmpty(params)
            ? GetWarehousesHostingQuery()
            : GetWarehousesQuery();

        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetStockByWhouse = async (req, res) => {
    const obj = req.query;
    let props = ['seller_id', 'whouse_id'];

    try {
        const execute_sp = GetExecuteSP();
        const main_query = GetMainQuery();
        const calc_ord_amount = GetCalcOrdAmountQuery();

        const queryMainWh = `select isnull(info_value, 0) as main_whouse_id
                             from tbl_br_general_info
                             where info_name = 'MAIN_WAREHOUSE_ID'`;

        const main_whouse_id = await ExecQueryGetValue(queryMainWh, 'main_whouse_id');

        const strUnion = str_format(
            main_query, '',
            str_format(calc_ord_amount, '1,5', ''),
            str_format(calc_ord_amount, '6', ''),
            main_whouse_id
        );

        let query = execute_sp + strUnion;
        let main_wh_stock = await ExecQueryGetRows(query);
        let other_wh_stock = null;

        if (CheckObjProps(obj, props) && obj['whouse_id'] !== main_whouse_id) {
            // const extra = `and f.salesman_id = '${obj['seller_id']}'`;
            const extra = ``;

            const strUnionExtra = str_format(
                main_query, extra,
                str_format(calc_ord_amount, '1,5', extra),
                str_format(calc_ord_amount, '6', extra),
                obj['whouse_id']
            );

            other_wh_stock = await ExecQueryGetRows(strUnionExtra);
        }

        const joined_wh_stock = other_wh_stock !== null ? main_wh_stock.concat(other_wh_stock) : main_wh_stock;

        ResSend(res, httpSts.Success, null, joined_wh_stock);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};

const GetPersonalStock = async(req, res) =>
{
    try
    {
        let whouse_id = req.query['whouse_id'];

        if(CheckObjForEmpty(whouse_id))
        {

            let rows = await ExecQueryGetRows(GetPersonalStockQuery(whouse_id));
            ResSend(res, httpSts.Success, null, rows);
        }
        else
            ResSend(res, httpSts.ServerError, 'Get request \'whouse_id\' params is empty!');
        
    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

module.exports = {
    GetWarehouses,
    GetStockByWhouse,
    GetPersonalStock
}