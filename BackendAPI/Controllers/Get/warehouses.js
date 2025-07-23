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
    const requiredProps = ['seller_id', 'whouse_id'];

    try {
        // Step 1: SP-ni işlet
        const recalcQuery = await LoadQuery('SpRecalcTotals', 'Werehouses');
        await ExecQueryGetRows(recalcQuery); 

        // Step 2: MAIN_WHOUSE_ID alyň
        const mainWhouseIdQuery = `
            SELECT ISNULL(info_value, 0) AS main_whouse_id 
            FROM tbl_br_general_info 
            WHERE info_name = 'MAIN_WAREHOUSE_ID'`;
        const main_whouse_id = await ExecQueryGetValue(mainWhouseIdQuery, 'main_whouse_id');

        // Step 3: Main sklad üçin stock
        const mainStockQuery = await LoadQuery('MainWhStock', 'Werehouses', [main_whouse_id]);
        const main_wh_stock = await ExecQueryGetRows(mainStockQuery);

        let other_wh_stock = null;

        // Step 4: Eger başga sklad soralsa — goşmaça stock çek
        if (CheckObjProps(obj, requiredProps) && obj['whouse_id'] !== main_whouse_id) {
            const otherStockQuery = await LoadQuery('other_wh_stock', 'Warehouses', [
                obj['seller_id'], obj['whouse_id']
            ]);
            other_wh_stock = await ExecQueryGetRows(otherStockQuery);
        }

        // Step 5: Birleşdir
        const result = other_wh_stock ? main_wh_stock.concat(other_wh_stock) : main_wh_stock;
        ResSend(res, httpSts.Success, null, result);

    } catch (err) {
        ResSend(res, httpSts.ServerError, null, `GetStockByWhouse Error: ${err.message}`);
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