const str_format = require( '@stdlib/string-format' );
const { ExecQueryGetRows, ExecQueryGetValue, ResSend, CheckObjForEmpty,
        CheckObjProps, LoadQuery} =  require('../../../Common/functions.js');
const { httpSts } =  require('../../../Common/static.js');



const GetWarehouses = async (req, res) => {
    try {
        let params = req.query['is_hosting'];
        let query = CheckObjForEmpty(params)
            ? await LoadQuery('warehouses_with_firm' , 'Werehouses')
            : await LoadQuery('warehouse_list_with_status' , 'Werehouses');

        let rows = await ExecQueryGetRows(query);
        ResSend(res, httpSts.Success, null, rows);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};
const GetStockByWhouse = async (req, res) => {
    const obj = req.query;
    const props = ['seller_id', 'whouse_id'];

    try {
        const execute_sp = 'exec sp_mg_recalc_mat_totals;';
        await ExecQuery(execute_sp);
        const queryMainWh = `select isnull(info_value, 0) as main_whouse_id
                             from tbl_br_general_info
                             where info_name = 'MAIN_WAREHOUSE_ID'`;
        const main_whouse_id = await ExecQueryGetValue(queryMainWh, 'main_whouse_id'); 
        const calcOrdAmount15 = `(${await LoadQuery('GetCalcOrdAmountQuery', 'Werehouses', ['1,5', ''])})`;
        const calcOrdAmount6 = `(${await LoadQuery('GetCalcOrdAmountQuery', 'Werehouses', ['6', ''])})`;

        const main_query = await LoadQuery('GetMainQuery', 'Werehouses', ['', calcOrdAmount15, calcOrdAmount6, `(${main_whouse_id})`]);
        const main_wh_stock = await ExecQueryGetRows(main_query);

        let other_wh_stock = null; 

        if (CheckObjProps(obj, props) && obj['whouse_id'] !== main_whouse_id) {
            const extra = `and f.salesman_id = '${obj['seller_id']}'`;

            const calcExtra15 = `(${await LoadQuery('GetCalcOrdAmountQuery', 'Werehouses', ['1,5', extra])})`;
            const calcExtra6 = `(${await LoadQuery('GetCalcOrdAmountQuery', 'Werehouses', ['6', extra])})`;

            const other_query = await LoadQuery('GetMainQuery', 'Werehouses', [extra, calcExtra15, calcExtra6, `(${obj['whouse_id']})`]);
            other_wh_stock = await ExecQueryGetRows(other_query);
        }

        const joined = other_wh_stock ? main_wh_stock.concat(other_wh_stock) : main_wh_stock;

        ResSend(res, httpSts.Success, null, joined);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};


const GetPersonalStock = async (req, res) => {
    try {
        let whouse_id = req.query['whouse_id'];
        console.log('whouse_id:', whouse_id);
        if (CheckObjForEmpty(whouse_id)) {
            const query = await LoadQuery('GetPersonalStockQuery', 'Werehouses', [whouse_id], );
            console.log('SQL Query:', query);
            const rows = await ExecQueryGetRows(query);
            console.log('ROWS:', rows);
            ResSend(res, httpSts.Success, null, rows);
        } else {
            ResSend(res, httpSts.ServerError, 'Get request \'whouse_id\' params is empty! ');
        }

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

module.exports = {
    GetWarehouses,
    GetStockByWhouse,
    GetPersonalStock
}