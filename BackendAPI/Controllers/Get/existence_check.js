const sql = require('mssql');

const { AxiosGet, ResSend, CheckObjProps, CheckResObjKey,
        CheckObjForEmpty } =  require('../../../Common/functions.js');
const { GetConnPool, sqlConfig } =  require('../../../Common/mssql.js');
const { httpSts } =  require('../../../Common/static.js');

const IsExistPartner = async (req, res) =>
{
    try
    {
        let partner_guid = req.query['partner_guid'];

        if (CheckObjForEmpty(partner_guid))
        {
            let strsel = `declare @real_id int; declare @partner_id int;
                            set @real_id=(select real_id from tbl_br_matching 
                                            where last_id=@partner_guid and matching_type='client');
                            set @partner_id=(select top 1 arap_id from tbl_mg_arap 
                                                where arap_id=@real_id or arap_id_guid=@partner_guid);
                            
                            select case when isnull(@real_id, -1) > 0 then cast(@real_id as varchar) 
                            when isnull(@partner_id, -1) > 0 then cast(@partner_id as varchar) 
                            else 'doesnt_exist' end as result`;

            const sqlConnPool = await GetConnPool();
            let result = await sqlConnPool.request()
                 .input('partner_guid', sql.VarChar, partner_guid)
                 .query(strsel);

            let obj = result['recordset'][0].result;
            ResSend(res, httpSts.Success, 'result:', obj);
        }
        else
            ResSend(res, httpSts.BadRequest, 'Get request params is empty!');

    }
    catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const IsExistInvoice = async (req, res) =>
{
    try
    {
        let invoice_guid = req.query['inv_file_id'];

        if (CheckObjForEmpty(invoice_guid))
        {
            // let strsel = `declare @invoice_id int; set @invoice_id=(select real_id from tbl_br_matching 
            //                 where last_id = @invoice_guid and matching_type='invoice') select case 
            //                 isnull(@invoice_id,-1) when '-1' then 'doesnt_exist' else isnull
            //                 ((select '[\"' + Convert(varchar, inv_id) + '\",' + '\"' + 
            //                 convert(varchar, fich_id) + '\",\"' +  Convert(varchar, 
            //                 inv_payment_status_id) + '\"]' from v_mg_inv_list_pay_status v 
            //                 where inv_id=@invoice_id), 'doesnt_exist') end as result`;

            let strsel = `declare @invoice_id int; set @invoice_id=(select real_id from tbl_br_matching 
                            where last_id = @invoice_guid and matching_type='invoice');
                          select case isnull(@invoice_id,-1) when '-1' then 'doesnt_exist' else 
                            isnull((select '[' + Convert(varchar, inv_id) + ',' + convert(varchar, fich_id)
                            + ',' + Convert(varchar, inv_payment_status_id) + ']' from v_mg_inv_list_pay_status v
                            where inv_id=@invoice_id), 'doesnt_exist') end as result`;

            const sqlConnPool = await GetConnPool();
            let result = await sqlConnPool.request()
                 .input('invoice_guid', sql.VarChar, invoice_guid)
                 .query(strsel);

            let obj = result['recordset'][0].result;

            console.log(obj)

            ResSend(res, httpSts.Success, 'result:', `${obj}`);
        }
        else
            ResSend(res, httpSts.BadRequest, 'Get request params is empty!');

    }
    catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const IsExistMatInvoice = async (req, res) =>
{
    try
    {
        let mat_inv_guid = req.query['mat_inv_file_id'];

        if (CheckObjForEmpty(mat_inv_guid))
        {
            let strsel = `declare @mat_inv_id int; set @mat_inv_id=(select real_id from tbl_br_matching 
                            where last_id = @mat_inv_guid and matching_type='mat_invoice'); select case 
                            isnull(@mat_inv_id,-1) when '-1' then 'doesnt_exist' else isnull((select 
                            convert(varchar, mat_inv_head_id) from tbl_mg_mat_inv_head where 
                            mat_inv_head_id=@mat_inv_id), 'doesnt_exist') end as result`;

            const sqlConnPool = await GetConnPool();
            let result = await sqlConnPool.request()
                 .input('mat_inv_guid', sql.VarChar, mat_inv_guid)
                 .query(strsel);

            let obj = result['recordset'][0].result;
            ResSend(res, httpSts.Success, 'result:', obj);
        }
        else
            ResSend(res, httpSts.BadRequest, 'Get request params is empty!');

    }
    catch (err) {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const IsExistDeviceInfo = async (req, res) =>
{
    const obj = req.query; let props = ['device', 'udid', 'bt_level'];

    try
    {
        if (CheckObjProps(obj, props)) {
            let uniq_dev_id = req.query['udid'];

            if (CheckObjForEmpty(uniq_dev_id))
            {
                await sql.connect(sqlConfig).then(async (pool) =>
                {
                    return await pool.request()
                        .input('udid', sql.VarChar, uniq_dev_id)
                        .query(`declare @device_id int; set @device_id=(select device_id from tbl_br_devices_info
                                        where device_udid = @udid); select case when isnull(@device_id, -1) != '-1'
                                        then convert(varchar, @device_id) else 'doesnt_exist' end as result`);
                }).then(async (result) =>
                {
                    if (!CheckResObjKey(result))
                    {
                        ResSend(res, 'Error get [ Device ID ] in DB => ', result, false);
                        return;
                    }

                    let obj = result['recordset'][0].result;

                    if (obj.includes('doesnt_exist'))
                    {
                        const config =
                        {
                            timeout: 5000,
                            params:
                            {
                                udid: uniq_dev_id,
                                device: req.query['device'],
                                bt_level: req.query['bt_level']
                            }
                        };

                        data_obj = await AxiosGet('/post/procedure/set_device_sync', config);
                        if (!data_obj)
                        {
                            let message = 'Error check & register [ Device ID ] => ';
                            ResSend(res, httpSts.ServerError, message, data_obj);
                            return;
                        }
                    }
                    
                    ResSend(res, httpSts.Success, 'result:', obj);

                }).catch(err =>
                {
                    console.log(err);
                    ResSend(res, httpSts.ServerError, 'Error check & register [ Device ID ] => ', `${ err }`);
                })
            }
            else
                ResSend(res, httpSts.BadRequest, 'Get request [ Device ID ] parameter is empty!');
        }
        else
            ResSend(res, httpSts.BadRequest, 'Get request params is empty!');
    }
    catch (err)
    {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

const IsExistDescription = async (req, res) =>
{
    try
    {
        let desc_guid = req.query['desc_file_id'];

        if (CheckObjForEmpty(desc_guid))
        {
            let strsel = `declare @real_id int; declare @desc_fich_id int;
                            set @real_id=(select real_id from tbl_br_matching where 
                                            last_id=@desc_guid and matching_type='desc');
                            set @desc_fich_id=(select Convert(varchar, fich_id) from tbl_mg_order_fich
                                                where fich_id=@real_id or fich_id_guid=@desc_guid);
                                                        
                            select case when isnull(@real_id, -1) > 0 then cast(@real_id as varchar) 
                            when isnull(@desc_fich_id, -1) > 0 then cast(@desc_fich_id as varchar) 
                            else 'doesnt_exist' end as result`;
            
            const sqlConnPool = await GetConnPool();
            let result = await sqlConnPool.request()
                 .input('desc_guid', sql.VarChar, desc_guid)
                 .query(strsel);

            let obj = result['recordset'][0].result;
            ResSend(res, httpSts.Success, 'result:', obj);
        }
        else
            ResSend(res, httpSts.BadRequest, 'Get request params is empty!');

    }
    catch (err)
    {
        ResSend(res, httpSts.ServerError, null, `${err}`);
    }
}

module.exports =
{
    IsExistPartner,
    IsExistInvoice,
    IsExistMatInvoice,
    IsExistDeviceInfo,
    IsExistDescription
}