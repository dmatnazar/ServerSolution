const { ExecQueryGetRows, ResSend, CheckObjProps,
        CheckObjForEmpty, ConvertToSQLFormat } =  require('../../../Common/functions.js');
const { httpSts } =  require('../../../Common/static.js');
const { GetSalesByMaterialsQuery } = require('../../../Queries/Reports/GetSalesByMaterialsQuery.js');

const GetSalesByMaterials = async(req, res) =>
{
    const data_obj = req.query; let props = ['dt_begin', 'dt_end', 'seller_id'];

    if(CheckObjProps(data_obj, props))
    {
        try
        {
            let cond = `i.inv_date between ${ ConvertToSQLFormat(data_obj['dt_begin']) }
                                       and ${ ConvertToSQLFormat(data_obj['dt_end']) } `;
            
            const seller_id = data_obj['seller_id'];
            if(CheckObjForEmpty(seller_id) && parseInt(seller_id) > 0)
                cond += `and i.salesman_id = '${ seller_id }'`;
            
            let rows = await ExecQueryGetRows(GetSalesByMaterialsQuery(cond));
            ResSend(res, httpSts.Success, null, rows);

        } catch (err)
        {
            ResSend(res, httpSts.ServerError, null, `${err}`);
        }
    }
    else
        ResSend(res, httpSts.BadRequest, 'Get request params is empty!', null);
}

module.exports =
{
    GetSalesByMaterials
}