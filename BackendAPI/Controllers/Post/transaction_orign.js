const sql = require('mssql');

const { ResSend, CheckResObjKey, ExecQueryGetValue, DoMatchingInDB  } =  require('../../../Common/functions.js');
const { sqlConfig } =  require('../../../Common/mssql.js');
const { httpSts } =  require('../../../Common/static.js');

const AddOrder = async (req, res) =>
{
    let params, parent_data, order_head, order_lines;
    let order_id = -1, empty = '', message = '';

    try
    {
        params = req.body.parameters;
        parent_data = req.body.data_obj.parent_data[0];
        order_head = req.body.data_obj.order_head[0];
        order_lines = req.body.data_obj.order_lines;
    }
    catch (err)
    {
        ResSend(res, httpSts.BadRequest, 'Error => ', `${err}`);
        return;
    }

    await sql.connect(sqlConfig).then(async (pool) =>
    {
        return await pool.request()
            .input('ord_file_id', sql.VarChar, parent_data['ord_file_id'])
            .query(`declare @real_id int; declare @result varchar;
                    set @real_id=(select real_id from tbl_br_matching 
                                    where last_id=@ord_file_id and matching_type='order');
                    select isnull((select top 1 '[\"' + Convert(varchar, fich_id) + '\",' + '\"' + 
                                    Convert(varchar, ord_status_id) + '\"]' from tbl_mg_order_fich 
                                    where fich_id=@real_id or fich_id_guid=@ord_file_id), 'doesnt_exist') 
                                    as result`);
    }).then(async (result) =>
    {
        if (!CheckResObjKey(result))
        {
            message = 'Error get [ Order Guid ] in do matching => ';
            ResSend(res, httpSts.ServerError, message, result);
            return;
        }

        let recordset = result.recordset;
        const connPool = new sql.ConnectionPool(sqlConfig);
        await connPool.connect(); let transaction;

        try
        {
            transaction = new sql.Transaction(connPool);
            await transaction.begin();

            if (recordset.length > 0 && recordset[0].result !== 'doesnt_exist') {
                const obj_ord_id = JSON.parse(recordset[0].result);
                let order_id = obj_ord_id[0], ord_sts_id = obj_ord_id[1];

                if (ord_sts_id != 1) // status garashylyar bolmasa
                {
                    order_head['ord_code'] = `${order_head['ord_code']}_${ord_sts_id}`;
                    order_head['ord_desc'] = `${order_head['ord_desc']}=>[ Merkezde işlenenden soňra üýtgedilen! ]`;
                }
                else
                {
                    let request = new sql.Request(transaction)
                            .input('fich_id', sql.Int, order_id)

                    /*let response =*/ await request.execute('sp_mg_del_order_inv');
                    //console.log('sp_mg_del_order_inv res:', response);
                }
            }
            // else
            //     console.log('recordset: ', recordset);

            let request = new sql.Request(transaction)
                .input('fich_id', sql.Int, 0)
                .input('fich_code', sql.NVarChar, order_head['ord_code'])
                .input('fich_date', sql.DateTime, order_head['ord_datetime'])
                .input('fich_total', sql.Float, order_head['ord_subtotal'])
                .input('fich_type_id', sql.Int, order_head['ord_type_id'])
                .input('arap_id', sql.Int, parent_data['partner_id'])
                .input('div_id', sql.Int, parent_data['div_id'])
                .input('dept_id', sql.Int, parent_data['dept_id'])
                .input('plant_id', sql.Int, 1)
                .input('wh_id', sql.Int, order_head['whouse_id'])
                .input('p_id', sql.Int, 1)
                .input('inv_id', sql.Int, 0)
                .input('fich_desc', sql.NVarChar, order_head['ord_desc'])
                .input('fich_discount', sql.Float, order_head['ord_disc_amount'])
                .input('fich_nettotal', sql.Float, order_head['ord_nettotal'])
                .input('salesman_id', sql.Int, order_head['seller_id'])
                .input('T_ID', sql.Int, 1) // USER ID
                .input('spe_code', sql.NVarChar, order_head['ord_priority'])
                .input('group_code', sql.NVarChar, empty)
                .input('security_code', sql.NVarChar, empty)
                .input('payplan_id', sql.Int, 0)
                .input('ord_status_id', sql.Int, order_head['ord_status_id'])
                .input('bank_acc_id_client', sql.Int, 0)
                .input('bank_acc_id_local', sql.Int, 0)
                .output('fich_id_iden', sql.Int)

            let response = await request.execute('sp_mg_add_order_fich');
            //console.log('sp_mg_add_order_fich res:', response);

            if (!CheckResObjKey(response) || response.output['fich_id_iden'] < 1)
            {
                message = 'Error insert [ Order head ] => ';
                ResSend(res, httpSts.ServerError, message, response);
                
                await transaction.rollback(); return;
            }
            else
                order_id = response.output['fich_id_iden'];

            let loop_continue = true;
            for (let k = 0; k < order_lines.length && loop_continue; k++)
            {
                let ord_line = order_lines[k];

                request = new sql.Request(transaction)
                    .input('fich_line_id', sql.Int, 0)
                    .input('fich_line_amount', sql.Float, ord_line['ord_line_amount'])
                    .input('fich_line_price', sql.Float, ord_line['ord_line_price'])
                    .input('fich_line_total', sql.Float, ord_line['ord_line_subtotal'])
                    .input('inv_id', sql.Int, 0)
                    .input('fich_id', sql.Int, order_id)
                    .input('material_id', sql.Int, ord_line['material_id'])
                    .input('fich_line_desc', sql.NVarChar, empty)
                    .input('unit_det_id', sql.Int, ord_line['mtrl_unit_det_id'])
                    .input('fich_line_disc_prc', sql.Float, ord_line['ord_line_disc_prct'])
                    .input('fich_line_disc_amount', sql.Float, ord_line['ord_line_disc_amount'])
                    .input('fich_line_nettotal', sql.Float, ord_line['ord_line_nettotal'])
                    .input('service_id', sql.Int, 0)
                    .input('fich_line_expiredate', sql.DateTime, new Date(2000, 0))
                    .input('fich_line_serialno', sql.NVarChar, empty)
                    .input('spe_code_line', sql.NVarChar, `${ord_line['ord_line_weight']}`)
                    .input('group_code_line', sql.NVarChar, empty)
                    .input('security_code_line', sql.NVarChar, empty)
                    .input('spe_code1', sql.NVarChar, empty)
                    .input('spe_code2', sql.NVarChar, empty)
                    .input('spe_code3', sql.NVarChar, empty)
                    .input('spe_code4', sql.NVarChar, empty)
                    .input('spe_code5', sql.NVarChar, empty)
                    .input('spe_code6', sql.NVarChar, empty)
                    .input('spe_code7', sql.NVarChar, empty)
                    .input('spe_code8', sql.NVarChar, empty)
                    .input('spe_code9', sql.NVarChar, empty)
                    .input('line_status_id', sql.Int, 0)
                    .input('user_name', sql.NVarChar, empty)
                    .input('salesman_id', sql.Int, 0)
                    .input('fich_line_service_amount', sql.Decimal, 0)
                    .input('fich_line_tax', sql.Decimal, 0)
                    .output('fich_line_iden', sql.Int)

                response = await request.execute('sp_mg_add_order_fich_line');
                //console.log('sp_mg_add_order_fich_line res:', response);

                if (order_id < 1 || !CheckResObjKey(response) || response.output['fich_line_iden'] < 1)
                {
                    message = 'Error insert [ Order line ] => ';
                    ResSend(res, httpSts.ServerError, message, response);

                    await transaction.rollback(); loop_continue = false; return;
                }
            }

            response = await DoMatchingInDB(order_id, parent_data['ord_file_id'], 'order');

            if (response.success)
            {
                let query = `update tbl_mg_order_fich set fich_id_guid = '${parent_data['ord_file_id']}' 
                                                                         where fich_id = '${order_id}'`;
                let result = await request.query(query);

                if (!CheckResObjKey(result) || result.rowsAffected[0] < 1)
                {
                    message = 'Error update [ Order Guid ] => ';
                    ResSend(res, httpSts.ServerError, message, query.replaceAll('\n', ''));

                    await transaction.rollback();
                }
                else
                {
                    await transaction.commit();
                    ResSend(res, httpSts.Success, 'ord_identity:', order_id);
                }
            }
            else
            {
                message = 'Error insert [ Order Guid ] in do matching => ';
                ResSend(res, httpSts.ServerError, message, response.object);

                await transaction.rollback();
            }
        }
        catch (err)
        {
            message = 'Error insert [ Order & Order lines ] => ';
            ResSend(res, httpSts.ServerError, message, `${err}`);

            await transaction.rollback();
        }
        finally
        {
            await connPool.close();
        }
    }).catch(err =>
    {
        message = 'Error insert [ Order & Order lines ] => ';
        ResSend(res, httpSts.ServerError, message, `${err}`);
    })
}

const AddInvoice = async (req, res) => {

    let params, parent_data, invoice_head, dlvnote_head, dlvnote_lines;
    let dlvnote_id = -1, invoice_id = -1, inv_type_id = -1;
    let empty = '', message = '';

    try
    {
        params = req.body.parameters;
        parent_data = req.body.data_obj.parent_data[0];
        invoice_head = req.body.data_obj.invoice_head[0];
        dlvnote_head = req.body.data_obj.dlvnote_head[0];
        dlvnote_lines = req.body.data_obj.dlvnote_lines;

        inv_type_id = invoice_head['inv_type_id'].toString();
        if (inv_type_id.length < 1)
        {
            ResSend(res, httpSts.BadRequest, `[ Invoice type ID ] => `, inv_type_id);
            return;
        }
    }
    catch (err)
    {
        ResSend(res, httpSts.BadRequest, 'Error => ', `${err}`);
        return;
    }

    const connPool = new sql.ConnectionPool(sqlConfig);
    await connPool.connect(); let transaction;

    try
    {
        transaction = new sql.Transaction(connPool);
        await transaction.begin();

        let request = new sql.Request(transaction)
            .input('fich_id', sql.Int, 0)
            .input('fich_code', sql.NVarChar, dlvnote_head['dlvnote_code'])
            .input('fich_date', sql.DateTime, dlvnote_head['dlvnote_datetime'])
            .input('fich_total', sql.Float, dlvnote_head['dlvnote_subtotal'])
            .input('fich_type_id', sql.Int, dlvnote_head['dlvnote_type_id'])
            .input('arap_id', sql.Int, dlvnote_head['partner_id'])
            .input('div_id', sql.Int, parent_data['div_id'])
            .input('dept_id', sql.Int, parent_data['dept_id'])
            .input('plant_id', sql.Int, 1)
            .input('wh_id', sql.Int, dlvnote_head['whouse_id'])
            .input('p_id', sql.Int, 1)
            .input('inv_id', sql.Int, 0)
            .input('fich_desc', sql.NVarChar, dlvnote_head['dlvnote_desc'])
            .input('fich_discount', sql.Float, dlvnote_head['dlvnote_disc_amount'])
            .input('fich_nettotal', sql.Float, dlvnote_head['dlvnote_nettotal'])
            .input('salesman_id', sql.Int, dlvnote_head['seller_id'])
            .input('T_ID', sql.Int, 1) // USER ID
            .input('spe_code', sql.NVarChar, dlvnote_head['dlvnote_priority'])
            .input('group_code', sql.NVarChar, empty)
            .input('security_code', sql.NVarChar, empty)
            .input('payplan_id', sql.Int, 0)
            .output('fich_id_iden', sql.Int)

        let response = await request.execute('sp_mg_add_fich');
        console.log('sp_mg_add_fich res:', response);

        if (!CheckResObjKey(response) || response.output['fich_id_iden'] < 1)
        {
            message = `Error insert [ Delivery note head ] => `;
            ResSend(res, httpSts.ServerError, message, response);

            await transaction.rollback(); return;
        }
        else
            dlvnote_id = response.output['fich_id_iden'];

        //------------------------------------------------------------------------------------------------------//

        request = new sql.Request(transaction)
            .input('inv_id', sql.Int, 0)
            .input('inv_code', sql.NVarChar, invoice_head['inv_code'])
            .input('inv_date', sql.DateTime, invoice_head['inv_datetime'])
            .input('inv_total', sql.Float, invoice_head['inv_subtotal'])
            .input('inv_type_id', sql.Int, inv_type_id)
            .input('arap_id', sql.Int, parent_data['partner_id'])
            .input('div_id', sql.Int, parent_data['div_id'])
            .input('dept_id', sql.Int, parent_data['dept_id'])
            .input('plant_id', sql.Int, 1)
            .input('wh_id', sql.Int, dlvnote_head['whouse_id'])
            .input('p_id', sql.Int, 1)
            .input('fich_id', sql.Int, dlvnote_id)
            .input('inv_desc', sql.NVarChar, invoice_head['inv_desc'])
            .input('inv_discount', sql.Float, invoice_head['inv_disc_amount'])
            .input('inv_nettotal', sql.Float, invoice_head['inv_nettotal'])
            .input('salesman_id', sql.Int, invoice_head['seller_id'])
            .input('T_ID', sql.Int, 1) // USER ID
            .input('spe_code', sql.NVarChar, invoice_head['inv_priority'])
            .input('group_code', sql.NVarChar, empty)
            .input('security_code', sql.NVarChar, empty)
            .input('payplan_id', sql.Int, 0)
            .input('bank_acc_id', sql.Int, 0)
            .input('inv_id_guid', sql.NVarChar, invoice_head['inv_file_id'])
            .output('inv_id_iden', sql.Int)

        response = await request.execute('sp_mg_add_inv');
        console.log('sp_mg_add_inv res:', response);

        if (!CheckResObjKey(response) || response.output['inv_id_iden'] < 1)
        {
            message = `Error insert [ Invoice ] =>`;
            ResSend(res, httpSts.ServerError, message, response);

            await transaction.rollback(); return;
        }
        else
            invoice_id = response.output['inv_id_iden'];

        //------------------------------------------------------------------------------------------------------//

        let cl_total = 0, cl_type = 2;
        let cl_credit = invoice_head['inv_nettotal'];

        if (parseInt(inv_type_id) !== 8)
        {
            cl_credit = 0, cl_type = 1;
            cl_total = invoice_head['inv_nettotal'];
        }

        request = new sql.Request(transaction)
            .input('cl_id', sql.Int, 0)
            .input('cl_total', sql.Float, cl_total)
            .input('cl_type', sql.Int, cl_type)
            .input('cl_trans_name', sql.NVarChar, parent_data['inv_type_name_tm'])
            .input('inv_id', sql.Int, invoice_id)
            .input('bank_fich_head_id', 0)
            .input('arap_id', sql.Int, parent_data['partner_id'])
            .input('ks_line_id', sql.Int, 0)
            .input('cl_credit', sql.Float, cl_credit)

        response = await request.execute('sp_mg_add_update_cl_trans');
        console.log('sp_mg_add_update_cl_trans res:', response);

        if (!CheckResObjKey(response))
        {
            message = `Error insert [ Client translines ] => `;
            ResSend(res, httpSts.ServerError, message, response);

            await transaction.rollback(); return;
        }

        //------------------------------------------------------------------------------------------------------//

        let loop_continue = true;
        for (let k = 0; k < dlvnote_lines.length && loop_continue; k++)
        {
            try
            {
                let dlvnote_line = dlvnote_lines[k];
                request = new sql.Request(transaction)
                    .input('fich_line_id', sql.Int, 0)
                    .input('fich_line_amount', sql.Float, dlvnote_line['dlvnote_line_amount'])
                    .input('fich_line_price', sql.Float, dlvnote_line['dlvnote_line_price'])
                    .input('fich_line_total', sql.Float, dlvnote_line['dlvnote_line_subtotal'])
                    .input('inv_id', sql.Int, invoice_id)
                    .input('fich_id', sql.Int, dlvnote_id)
                    .input('material_id', sql.Int, dlvnote_line['material_id'])
                    .input('fich_line_desc', sql.NVarChar, empty)
                    .input('unit_det_id', sql.Int, dlvnote_line['mtrl_unit_det_id'])
                    .input('fich_line_disc_prc', sql.Float, dlvnote_line['dlvnote_line_disc_prct'])
                    .input('fich_line_disc_amount', sql.Float, dlvnote_line['dlvnote_line_disc_amount'])
                    .input('fich_line_nettotal', sql.Float, dlvnote_line['dlvnote_line_nettotal'])
                    .input('service_id', sql.Int, 0)
                    .input('fich_line_expiredate', sql.DateTime, new Date(2000, 0))
                    .input('fich_line_serialno', sql.NVarChar, empty)
                    .input('fich_line_date', sql.NVarChar, empty)
                    .input('spe_code_line', sql.NVarChar, `${dlvnote_line['dlvnote_line_weight']}`)
                    .input('group_code_line', sql.NVarChar, empty)
                    .input('security_code_line', sql.NVarChar, empty)
                    .output('fich_line_iden', sql.Int)

                response = await request.execute('sp_mg_add_fich_line');
                console.log('sp_mg_add_fich_line res:', response);

                if (!CheckResObjKey(response) || response.output['fich_line_iden'] < 1)
                {
                    message = `Error insert [ Delivery note line ] =>`;
                    ResSend(res, httpSts.ServerError, message, response);

                    await transaction.rollback(); loop_continue = false; return;
                }
                else
                {
                    let fich_line_iden = response.output['fich_line_iden'];

                    request = new sql.Request(transaction)
                        .input('material_id', sql.Int, dlvnote_line['material_id'])
                        .input('fich_line_id', sql.Int, fich_line_iden)
                        .input('mat_inv_line_id', sql.Int, 0)
                        .input('arap_id', sql.Int, dlvnote_head['partner_id'])
                        .input('mat_trans_type_id', sql.Int, dlvnote_line['trans_line_type_id'])
                        .input('mat_trans_type_code', sql.NVarChar, dlvnote_head['dlvnote_name_tm'])
                        .input('mat_trans_line_amount_out', sql.Float, dlvnote_line['trans_line_amount_out'])
                        .input('mat_trans_line_price_out', sql.Float, dlvnote_line['trans_line_price_out'])
                        .input('mat_trans_line_totalprice', sql.Float, dlvnote_line['trans_line_nettotal_out'])
                        .input('mat_trans_line_nettotal', sql.Float, dlvnote_line['trans_line_nettotal_out'])
                        .input('mat_trans_line_amount_in', sql.Float, dlvnote_line['trans_line_amount_in'])
                        .input('mat_trans_line_price_in', sql.Float, dlvnote_line['trans_line_price_in'])
                        .input('mat_trans_line_totalprice_in', sql.Float, dlvnote_line['trans_line_nettotal_in'])
                        .input('mat_trans_line_nettotal_in', sql.Float, dlvnote_line['trans_line_nettotal_in'])
                        .input('mat_trans_line_wh_id_out', sql.Float, dlvnote_line['trans_line_whouse_id_out'])
                        .input('mat_trans_line_wh_id_in', sql.Float, dlvnote_line['trans_line_whouse_id_in'])
                        .input('p_id', sql.Int, 1)
                        .input('fich_type_id', sql.Int, dlvnote_head['dlvnote_type_id'])
                        .input('unit_det_id', sql.Int, dlvnote_line['mtrl_unit_det_id'])

                    response = await request.execute('sp_mg_add_mat_trans_line');
                    console.log('sp_mg_add_mat_trans_line res:', response);

                    if (!CheckResObjKey(response))
                    {
                        message = `Error insert [ Material trans line ] =>`;
                        ResSend(res, httpSts.ServerError, message, response);

                        await transaction.rollback(); loop_continue = false; return;
                    }
                    else
                    {
                        request = new sql.Request(transaction)
                            .input('fich_line_id', sql.Int, fich_line_iden)
                            .input('mat_trans_line_id', sql.Int, 0)

                        response = await request.execute('sp_mg_update_mat_expire_date');
                        console.log('sp_mg_update_mat_expire_date res:', response);

                        if (!CheckResObjKey(response))
                        {
                            message = `Error update [ Material expire date ] => `;
                            ResSend(res, httpSts.ServerError, message, response);

                            await transaction.rollback(); loop_continue = false; return;
                        }
                    }
                }
            }
            catch (err)
            {
                message = `Error insert [ Delivery note trans lines ] => `;
                ResSend(res, httpSts.ServerError, message, `${err}`);

                await transaction.rollback(); loop_continue = false; return;
            }
        }

        //------------------------------------------------------------------------------------------------------//

        request = new sql.Request(transaction)
            .input('inv_id', sql.Int, invoice_id)
            .input('fich_id', sql.Int, dlvnote_id)

        response = await request.execute('sp_fich_inv_id');
        console.log('sp_fich_inv_id res:', response);

        if (!CheckResObjKey(response))
        {
            message = `Error update [ Invoice & Delivery Note ID ] => `;
            ResSend(res, httpSts.ServerError, message, response);

            await transaction.rollback(); return;
        }
        else
        {
            response = await DoMatchingInDB(invoice_id, parent_data['inv_file_id'], 'invoice');

            if (response.success)
            {
                await transaction.commit();
                ResSend(res, httpSts.Success, `result:`, new Array(["invoice_id", invoice_id], ["dlvnote_id", dlvnote_id]));
            }
            else
            {
                message = `Error insert [ Invoice Guid ] in do matching => `;
                ResSend(res, httpSts.ServerError, message, response.object);

                await transaction.rollback();
            }
        }
    } catch (err)
    {
        message = `Error insert [ Invoice & Delivery Note, Lines ] => `;
        ResSend(res, httpSts.ServerError, message, `${err}`);
        
        await transaction.rollback();
        console.log(message, err);
    }
    finally
    {
        await connPool.close();
    }
}

const AddMatInvoice = async (req, res) =>
{
    let params, parent_data, mat_inv_head, mat_inv_lines, mat_invoice_id = -1;
    let empty = '', message = '';

    try
    {
        params = req.body.parameters;
        parent_data = req.body.data_obj.parent_data[0];
        mat_inv_head = req.body.data_obj.mat_inv_head[0];
        mat_inv_lines = req.body.data_obj.mat_inv_lines;
    }
    catch (err)
    {
        ResSend(res, httpSts.BadRequest, 'Error => ', `${err}`);
        return;
    }

    const connPool = new sql.ConnectionPool(sqlConfig);
    await connPool.connect(); let transaction;

    try
    {
        transaction = new sql.Transaction(connPool);
        await transaction.begin();

        let request = new sql.Request(transaction)
            .input('mat_inv_head_id', sql.Int, 0)
            .input('mat_inv_code', sql.NVarChar, mat_inv_head['mat_inv_code'])
            .input('mat_inv_date', sql.DateTime, mat_inv_head['mat_inv_datetime'])
            .input('mat_inv_docno', sql.NVarChar, empty)
            .input('out_div_id', sql.Int, mat_inv_head['out_div_id'])
            .input('out_dept_id', sql.Int, mat_inv_head['out_dept_id'])
            .input('out_plant_id', sql.Int, 1)
            .input('out_wh_id', sql.Int, mat_inv_head['out_whouse_id'])
            .input('in_div_id', sql.Int, mat_inv_head['in_div_id'])
            .input('in_dept_id', sql.Int, mat_inv_head['in_dept_id'])
            .input('in_plant_id', sql.Int, 1)
            .input('in_wh_id', sql.Int, mat_inv_head['in_whouse_id'])
            .input('mat_inv_total', sql.Float, mat_inv_head['mat_inv_nettotal'])
            .input('p_id', sql.Int, 1)
            .input('mat_inv_type_id', sql.Int, 25)
            .input('mat_inv_desc', sql.NVarChar, mat_inv_head['mat_inv_desc'])
            .input('spe_code', sql.NVarChar, empty)
            .input('group_code', sql.NVarChar, empty)
            .input('security_code', sql.NVarChar, `${mat_inv_head['mat_inv_unit_amount']}`)
            .input('material_id', sql.Int, 0)
            .input('inv_id_auto_gen', sql.Int, 0)
            .input('salesman_id', sql.Int, mat_inv_head['seller_id'])
            .input('T_ID', sql.Int, 0)
            .output('mat_inv_iden', sql.Int)

        let response = await request.execute('sp_mg_add_update_mat_inv_head');
        console.log('sp_mg_add_update_mat_inv_head res:', response);

        if (!CheckResObjKey(response) || response.output['mat_inv_iden'] < 1)
        {
            message = `Error insert [ Material invoice head ] => `;
            ResSend(res, httpSts.ServerError, message, response);

            await transaction.rollback(); return;
        }
        else
            mat_invoice_id = response.output['mat_inv_iden'];

        let loop_continue = true, zero = 0, partner_id = zero;
        for (let k = 0; k < mat_inv_lines.length && loop_continue; k++)
        {
            try
            {
                let mat_inv_line = mat_inv_lines[k];
                request = new sql.Request(transaction)
                    .input('mat_inv_line_id', sql.Int, 0)
                    .input('material_id', sql.Int, mat_inv_line['material_id'])
                    .input('mat_inv_quantity', sql.Float, mat_inv_line['mat_inv_line_amount'])
                    .input('unit_det_id', sql.Int, mat_inv_line['mtrl_unit_det_id'])
                    .input('mat_inv_unit_price', sql.Float, mat_inv_line['mat_inv_line_price'])
                    .input('mat_inv_linenet', sql.Float, mat_inv_line['mat_inv_line_nettotal'])
                    .input('out_wh_id', sql.Int, mat_inv_line['out_whouse_id'])
                    .input('in_wh_id', sql.Int, mat_inv_line['in_whouse_id'])
                    .input('mat_inv_head_id', sql.Int, mat_invoice_id)
                    .input('fich_line_expiredate', sql.DateTime, mat_inv_line['mat_inv_line_crt_date'])
                    .input('fich_line_serialno', sql.NVarChar, empty)
                    .output('mat_inv_line_iden', sql.Int)

                response = await request.execute('sp_mg_add_update_mat_inv_line');
                console.log('sp_mg_add_update_mat_inv_line res:', response);

                if (!CheckResObjKey(response) || response.output['mat_inv_line_iden'] < 1)
                {
                    message = `Error insert [ Material invoice line ] =>`;
                    ResSend(res, httpSts.ServerError, message, response);

                    await transaction.rollback(); loop_continue = false; return;
                }
                else
                {
                    let mat_inv_line_iden = response.output['mat_inv_line_iden'];

                    if (mat_inv_line['trans_line_whouse_id_out'] < zero)
                        mat_inv_line['trans_line_whouse_id_out'] = zero;

                    if (mat_inv_line['trans_line_whouse_id_in'] < zero)
                        mat_inv_line['trans_line_whouse_id_in'] = zero;

                    request = new sql.Request(transaction)
                        .input('material_id', sql.Int, mat_inv_line['material_id'])
                        .input('fich_line_id', sql.Int, 0)
                        .input('mat_inv_line_id', sql.Int, mat_inv_line_iden)
                        .input('arap_id', sql.Int, partner_id)
                        .input('mat_trans_type_id', sql.Int, mat_inv_line['trans_line_type_id'])
                        .input('mat_trans_type_code', sql.NVarChar, parent_data['mat_inv_type_name_tm']) //'Ammara Iberme Fakturasy')
                        .input('mat_trans_line_amount_out', sql.Float, mat_inv_line['trans_line_amount_out'])
                        .input('mat_trans_line_price_out', sql.Float, mat_inv_line['trans_line_price_out'])
                        .input('mat_trans_line_totalprice', sql.Float, mat_inv_line['trans_line_nettotal_out'])
                        .input('mat_trans_line_nettotal', sql.Float, mat_inv_line['trans_line_nettotal_out'])
                        .input('mat_trans_line_amount_in', sql.Float, mat_inv_line['trans_line_amount_in'])
                        .input('mat_trans_line_price_in', sql.Float, mat_inv_line['trans_line_price_in'])
                        .input('mat_trans_line_totalprice_in', sql.Float, mat_inv_line['trans_line_nettotal_in'])
                        .input('mat_trans_line_nettotal_in', sql.Float, mat_inv_line['trans_line_nettotal_in'])
                        .input('mat_trans_line_wh_id_out', sql.Float, mat_inv_line['trans_line_whouse_id_out'])
                        .input('mat_trans_line_wh_id_in', sql.Float, mat_inv_line['trans_line_whouse_id_in'])
                        .input('p_id', sql.Int, 1)
                        .input('fich_type_id', sql.Int, mat_inv_head['mat_inv_type_id'])
                        .input('unit_det_id', sql.Int, mat_inv_line['mtrl_unit_det_id'])

                    response = await request.execute('sp_mg_add_mat_trans_line');
                    console.log('sp_mg_add_mat_trans_line res:', response);

                    if (!CheckResObjKey(response))
                    {
                        message = `Error insert [ Material trans line ] =>`;
                        ResSend(res, httpSts.ServerError, message, response);

                        await transaction.rollback(); loop_continue = false; return;
                    }
                }
            }
            catch (err)
            {
                message = `Error insert [ Material invoice trans lines ] => `;
                ResSend(res, httpSts.ServerError, message, `${err}`);

                await transaction.rollback(); loop_continue = false; return;
            }
        }

        response = await DoMatchingInDB(mat_invoice_id, parent_data['mat_inv_file_id'], 'mat_invoice');

        if (response.success)
        {
            let query = `update tbl_mg_mat_inv_head set mat_inv_head_id_guid = '${parent_data['mat_inv_file_id']}' 
                                                                     where mat_inv_head_id = '${mat_invoice_id}'`;
            let result = await request.query(query);

            if (!CheckResObjKey(result) || result.rowsAffected[0] < 1)
            {
                message = 'Error update [ Material invoice Guid ] => ';
                ResSend(res, httpSts.ServerError, message, query.replaceAll('\n', ''));

                await transaction.rollback();
            }
            else
            {
                await transaction.commit();
                ResSend(res, httpSts.Success, 'mat_inv_identity:', mat_invoice_id);
            }
        }
        else
        {
            message = `Error insert [ Material invoice Guid ] in do matching => `;
            ResSend(res, httpSts.ServerError, message, response.object);

            await transaction.rollback();
        }
    } catch (err)
    {
        message = `Error insert [ Material invoice, lines ] => `;
        ResSend(res, httpSts.ServerError, message, `${err}`);

        await transaction.rollback();

    } finally
    {
        await connPool.close();
    }
}

const AddInvPayments = async (req, res) => {

    let arr_obj = [{}], params, invoice_head, inv_payments;
    let ks_line_id = -1, inv_pay_id = -1, inv_type_id = -1;
    let empty = '', message = '';

    try
    {
        params = req.body.parameters;
        invoice_head = req.body.data_obj.invoice_head[0];
        inv_payments = req.body.data_obj.inv_payments;

        inv_type_id = invoice_head['inv_type_id'].toString();
        if (inv_type_id.length < 1)
        {
            ResSend(res, httpSts.BadRequest, `[ Invoice type ID ] => `, inv_type_id);
            return;
        }
    }
    catch (err)
    {
        ResSend(res, httpSts.BadRequest, 'Error => ', `${err}`);
        return;
    }

    const connPool = new sql.ConnectionPool(sqlConfig);
    await connPool.connect(); let transaction;

    try
    {
        transaction = new sql.Transaction(connPool);
        await transaction.begin();

        let is_commit = true;
        for (let k = 0; k < inv_payments.length && is_commit; k++)
        {
            const inv_payment = inv_payments[k];

            let query = `declare @inv_pay_id int; set @inv_pay_id = (select real_id from tbl_br_matching
                            where last_id='${inv_payment['pay_file_id']}' and matching_type='inv_payment')
                         select case isnull(@inv_pay_id,-1) when -1 then '-1' else isnull((select
                            Convert(varchar, inv_payment_id) from tbl_mg_inv_payment_history
                            where inv_payment_id = @inv_pay_id), '-1') end as result`;

            let result = ExecQueryGetValue(query, 'result');

            console.log('RESULT >>>>>>>> ', result, inv_payment['pay_file_id']);
            return;

            if (!CheckResObjKey(result))
            {

                message = `Error get [ Invoice payment real ID ] in do matching => `;
                ResSend(res, httpSts.ServerError, message, result);

                transaction.rollback(); is_commit = false; return;
            }
            else
            {
                let recordset = result.recordset;

                if (parseInt(recordset.output['result']) > 0) //!== -1)
                {
                    arr_obj.push
                    ({
                        "pay_real_id": recordset.output['result'],
                        "pay_file_id": inv_payment['pay_file_id']
                    });
                }
                else
                {
                    let ks_card_tr_type_id = 11;
                    let cl_type = 2, cl_total = 0;
                    let cl_credit = inv_payment['pay_amount'];

                    if (parseInt(inv_type_id) !== 8)
                    {
                        ks_card_tr_type_id = 12;
                        cl_type = 1; cl_credit = 0;
                        cl_total = inv_payment['pay_amount'];
                    }

                    let request = new sql.Request(transaction)
                        .input('ks_line_id', sql.Int, 0)
                        .input('ks_line_amount', sql.Float, inv_payment['pay_amount'])
                        .input('ks_line_ks_code', sql.NVarChar, `KSS_${inv_payment['inv_code']}`)
                        .input('ks_line_op_code', sql.NVarChar, `ISH_${inv_payment['pay_code']}`)
                        .input('ks_line_expline', sql.NVarChar, inv_payment['pay_desc'])
                        .input('ks_card_id', sql.Int, inv_payment['cash_id'])
                        .input('p_id', sql.Int, 1)
                        .input('ks_card_tr_type_id', sql.Int, ks_card_tr_type_id)
                        .input('ks_line_date', sql.DateTime, inv_payment['pay_datetime'])
                        .input('div_id', sql.Int, invoice_head['div_id'])
                        .input('dept_id', sql.Int, invoice_head['dept_id'])
                        .input('arap_id', sql.Int, inv_payment['partner_id'])
                        .input('ks_line_desc', sql.NVarChar, inv_payment['pay_desc'])
                        .input('bank_acc_id', sql.Int, 0)
                        .input('ks_line_prepayment', sql.Int, 0)
                        .input('spe_code', sql.NVarChar, empty)
                        .input('group_code', sql.NVarChar, empty)
                        .input('security_code', sql.NVarChar, empty)
                        .input('salesman_id', sql.Int, inv_payment['seller_id'])
                        .output('ks_iden', sql.Int)

                    let response = await request.execute('sp_mg_add_ks_lines');
                    console.log('sp_mg_add_ks_lines res:', response);

                    if (!CheckResObjKey(request))
                    {
                        message = `Error insert [ Cash translines ] => `;
                        ResSend(res, httpSts.ServerError, message, response);

                        transaction.rollback(); is_commit = false; return;
                    }
                    else
                    {
                        ks_line_id = response.output['ks_iden'];

                        request = new sql.Request(transaction)
                            .input('cl_id', sql.Int, 0)
                            .input('cl_total', sql.Float, cl_total)
                            .input('cl_type', sql.Int, cl_type)
                            .input('cl_trans_name', sql.NVarChar, invoice_head['payment_type'])
                            .input('inv_id', sql.Int, invoice_head['invoice_id'])
                            .input('bank_fich_head_id', 0)
                            .input('arap_id', sql.Int, invoice_head['partner_id'])
                            .input('ks_line_id', sql.Int, ks_line_id)
                            .input('cl_credit', sql.Float, cl_credit)

                        response = await request.execute('sp_mg_add_update_cl_trans');
                        console.log('sp_mg_add_update_cl_trans res:', response);

                        if (!CheckResObjKey(response))
                        {
                            message = `Error insert [ Client translines ] => `;
                            ResSend(res, httpSts.ServerError, message, response);

                            await transaction.rollback(); is_commit = false; return;
                        }

                        //---------------------------------------------------------------------------------------//

                        request = new sql.Request(transaction)
                            .input('inv_id', sql.Int, invoice_head['invoice_id'])
                            .input('ks_card_id', sql.Float, inv_payment['cash_id'])
                            .input('inv_payment_amount', sql.Int, inv_payment['pay_amount'])
                            .input('ks_line_id', sql.NVarChar, ks_line_id)
                            .input('T_ID', sql.Int, 1)
                            .input('inv_payment_desc', inv_payment['pay_desc'])

                        response = await request.execute('sp_mg_update_inv_payments');
                        console.log('sp_mg_update_inv_payments res:', response);

                        if (!CheckResObjKey(response))
                        {
                            message = `Error update [ Invoice payment ] => `;
                            ResSend(res, httpSts.ServerError, message, response);

                            await transaction.rollback(); is_commit = false; return;
                        }

                        //---------------------------------------------------------------------------------------//

                        request = new sql.Request(transaction);
                        response = await request.query(`select max(inv_payment_id) as max_inv_pay_id 
                                                                from tbl_mg_inv_payment_history`);
                        if (!CheckResObjKey(response))
                        {
                            message = `Error get [ Invoice payment ID ] => `;
                            ResSend(res, httpSts.ServerError, message, response);

                            await transaction.rollback(); is_commit = false; return;
                        }

                        inv_pay_id = response.recordset[0]['max_inv_pay_id'];

                        //---------------------------------------------------------------------------------------//

                        request = new sql.Request(transaction)
                            .input('ks_line_id', sql.Int, ks_line_id)

                        response = await request.execute('sp_mg_conf_payments_accounts');
                        console.log('sp_mg_conf_payments_accounts res:', response);

                        if (!CheckResObjKey(response))
                        {
                            message = `Error update [ Invoice payment ] => `;
                            ResSend(res, httpSts.ServerError, message, response);

                            await transaction.rollback(); is_commit = false; return;
                        }

                        //---------------------------------------------------------------------------------------//

                        request = new sql.Request(transaction)
                            .input('inv_id', sql.Int, invoice_head['invoice_id'])

                        response = await request.execute('sp_mg_conf_acc_cards');
                        console.log('sp_mg_conf_acc_cards res:', response);

                        if (!CheckResObjKey(response))
                        {
                            message = `Error update [ Invoice payment ] => `;
                            ResSend(res, httpSts.ServerError, message, response);

                            await transaction.rollback(); is_commit = false; return;
                        }
                        else
                        {
                            response = await DoMatchingInDB(inv_pay_id, inv_payment['pay_file_id'], 'inv_payment');

                            if (response.success)
                            {
                                await transaction.commit();
                                arr_obj.push({ "pay_real_id": inv_pay_id, "pay_file_id": inv_payment['pay_file_id'] });
                            }
                            else
                            {
                                message = `Error insert [ Invoice payment real ID ] in do matching => `;
                                ResSend(res, httpSts.ServerError, message, response.object);

                                await transaction.rollback(); is_commit = false; return;
                            }
                        }
                    }
                }
            }
        }

        if (is_commit)
            ResSend(res, httpSts.Success, `result:`, arr_obj);
    }
    catch (err)
    {
        message = `Error insert [ Invoices payment ] => `;
        ResSend(res, httpSts.ServerError, message, `${err}`);

        await transaction.rollback();
    } finally
    {
        await connPool.close();
    }
}

module.exports =
{
    AddOrder,
    AddInvoice,
    AddMatInvoice,
    AddInvPayments
}