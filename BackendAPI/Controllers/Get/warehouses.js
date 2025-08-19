const str_format = require( '@stdlib/string-format' );
const { ExecQueryGetRows, ExecQueryGetValue, ResSend, CheckObjForEmpty,
        CheckObjProps, LoadQuery} =  require('../../../Common/functions.js');
const { httpSts } =  require('../../../Common/static.js');



const GetWarehouses = async (req, res) => {
    try {
        let isHosting = req.query['is_hosting'];
        // console.log('is_hosting param:', isHosting);

        let query;

        // Parametr BAR bolsa we DOLY bolsa (false = NOT empty) — hosting üçin sorag
        if (isHosting !== undefined && isHosting !== null && isHosting !== '') {
            query = await LoadQuery('werehouses', 'warehouse_data', 'WarehousesWithFirm');
        } else {
            // Parametr ýok bolsa ýa-da boş bolsa — adaty ammar sanawy
            query = await LoadQuery('werehouses', 'warehouse_data', 'WarehouseListWithStatus');
        }

        let rows = await ExecQueryGetRows(query);

        ResSend(res, httpSts.Success, null, rows);
    } catch (err) {
        console.error("Error in GetWarehouses:", err);
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
};


const GetStockByWhouse = async (req, res) => {
    const obj = req.query;

    // -1 bolsa, 1 bilen çalşylýar
    obj.seller_id = obj.seller_id === '-1' ? '1' : obj.seller_id;
    obj.whouse_id = obj.whouse_id === '-1' ? '1' : obj.whouse_id;

    const requiredProps = ['seller_id', 'whouse_id'];
    // console.log('obj------', obj);

    try {
        // Step 1: SP-ni işlet
        const recalcQuery = 'exec sp_mg_recalc_mat_totals'
        await ExecQueryGetRows(recalcQuery);

        // Step 2: MAIN_WHOUSE_ID alyň
        const mainWhouseIdQuery = `
            SELECT ISNULL(info_value, 0) AS main_whouse_id 
            FROM tbl_br_general_info 
            WHERE info_name = 'MAIN_WAREHOUSE_ID'`;
        const main_whouse_id = await ExecQueryGetValue(mainWhouseIdQuery, 'main_whouse_id');
        // console.log('main_whouse_id:', main_whouse_id);
        // Step 3: Main sklad üçin stock
        const mainStockQuery = await LoadQuery('werehouses', 'stock_by_whouse', 'MainWhStock', [main_whouse_id]);
        // console.log('mainStockQuery:', mainStockQuery);
        const main_wh_stock = await ExecQueryGetRows(mainStockQuery);
        // console.log('main_wh_stock:', main_wh_stock);

        let other_wh_stock = null;

        // Step 4: Eger başga sklad soralsa — goşmaça stock çek
        if (CheckObjProps(obj, requiredProps) && obj['whouse_id'] !== main_whouse_id) {
            const otherStockQuery = await LoadQuery('werehouses', 'stock_by_whouse', 'OtherWhStock', [
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
        // console.log('whouse_id:', whouse_id);
        if (CheckObjForEmpty(whouse_id)) {
            const query = await LoadQuery('werehouses', 'personal_stock', 'GetPersonalStockQuery', [whouse_id], );
            // console.log('SQL Query:', query);
            const rows = await ExecQueryGetRows(query);
            // console.log('ROWS:', rows);
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