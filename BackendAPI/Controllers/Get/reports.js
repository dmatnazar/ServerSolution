const {
    ExecQueryGetRows, ResSend, CheckObjProps,
    CheckObjForEmpty, ConvertToSQLFormat, LoadQuery
} = require('../../../Common/functions.js');
const { httpSts } = require('../../../Common/static.js');

const GetSalesByMaterials = async (req, res) => {
    const data_obj = req.query;
    const props = ['dt_begin', 'dt_end', 'seller_id'];
    // console.log('data_obj ------', data_obj);

    if (CheckObjProps(data_obj, props)) {
        try {
            const startDate = ConvertToSQLFormat(data_obj['dt_begin']);
            const endDate = ConvertToSQLFormat(data_obj['dt_end']);
            const seller_id = parseInt(data_obj['seller_id']);
            // console.log('startDate' , startDate , 'endDate', endDate , 'seller_id---' , seller_id)

            // if (CheckObjForEmpty(seller_id) || seller_id > 0) {
            //     return ResSend(res, httpSts.BadRequest, 'Invalid seller_id!', null);
            // }

            const query = await LoadQuery('reports', 'sales_b_materials', 'GetSalesByMaterialsQuery', 
                [startDate, endDate, seller_id]);
            // const query = await ExecQueryGetRows(await LoadQuery("get_sales_by_materials", "Reports", [
            //     ConvertToSQLFormat(data_obj["dt_begin"]),
            //     ConvertToSQLFormat(data_obj["dt_end"]),
            //     `${data_obj["seller_id"]}`
            // console.log('query------' , query)


            const rows = await ExecQueryGetRows(query);
            ResSend(res, httpSts.Success, null, rows);

        } catch (err) {
            ResSend(res, httpSts.ServerError, null, `${err}`);
        }
    } else {
        ResSend(res, httpSts.BadRequest, 'Get request params is empty!', null);
    }
};




module.exports = {
    GetSalesByMaterials
};