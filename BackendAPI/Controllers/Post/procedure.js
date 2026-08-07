const fs = require('fs')
const sql = require('mssql');

const { ResSend, CheckObjProps, CheckResObjKey, CheckObjOrArrForNull,
    DoMatchingInDB, ImageCompress, ConvertClientDateToUTC } = require('../../../Common/functions.js');
const { GetConnPool, sqlConfig } = require('../../../Common/mssql.js');
const { httpSts } = require('../../../Common/static.js');
const path = require('path');

const AddGpsData = async (req, res) => {
    const params = req.body.parameters;
    const data_obj = req.body.data_obj;

    if (CheckObjOrArrForNull(data_obj)) {
        let query = `begin if not exists (select * from tbl_br_gps where gps_file_id = @gps_file_id) begin
                        insert into tbl_br_gps (gps_file_id, device_code, gps_date, latitude, longitude, altitude,
                        speed, accuracy, bearing, battery) values (@gps_file_id, @device_code, @create_dt, @latitude,
                        @longitude, @altitude, @speed, @accuracy, @bearing, @battery); end end`;
        try {
            const sqlConnPool = await GetConnPool();
            let loop_continue = true; let rows_id = [];

            for (let k = 0; k < data_obj.length && loop_continue; k++) {
                try {
                    let data_row = data_obj[k];
                    let result = await sqlConnPool.request()
                        .input('gps_file_id', sql.VarChar, data_row['gps_file_id'])
                        .input('device_code', sql.Char, params['device_code'])
                        .input('create_dt', sql.DateTime, ConvertClientDateToUTC(data_row['create_dt']))
                        .input('latitude', sql.Float, data_row['latitude'])
                        .input('longitude', sql.Float, data_row['longitude'])
                        .input('altitude', sql.Float, data_row['altitude'])
                        .input('speed', sql.Float, data_row['speed'])
                        .input('accuracy', sql.Float, data_row['accuracy'])
                        .input('bearing', sql.Float, data_row['bearing'])
                        .input('battery', sql.Int, data_row['battery'])
                        .query(query);
                    if (result)
                        rows_id.push(data_row['row_id']);
                }
                catch (err) {
                    ResSend(res, httpSts.ServerError, 'MSSQL error => ', `${err}`);
                    loop_continue = false; return;
                }
            }

            ResSend(res, httpSts.Success, 'result:', rows_id);
        }
        catch (err) {
            ResSend(res, httpSts.ServerError, 'Global error => ', `${err}`);
        }
    }
    else
        ResSend(res, httpSts.BadRequest, 'Get request params is empty!');
}

const AddUpdPartnerData = async (req, res) => {
    const params = req.body.parameters;
    const data_obj = req.body.data_obj[0];

    if (CheckObjOrArrForNull(data_obj)) {
        let empty = '', partner_id = -1, is_exist = false;

        await sql.connect(sqlConfig).then(async (pool) => {
            let strsel = `select top 1 a.* from tbl_mg_arap a left join tbl_br_matching m on 
                        a.arap_id = m.real_id  where arap_id_guid = '${data_obj['partner_guid']}' 
                        or last_id = convert(uniqueidentifier, '${data_obj['partner_guid']}')`;

            let response = await pool.request().query(strsel);
            if (CheckResObjKey(response))
                is_exist = response.recordset.length > 0;

            const data_row = is_exist ? response['recordset'][0] : {};
            const request = pool.request();

            if (is_exist) {
                partner_id = data_row['arap_id'];
                request.input('arap_id', sql.Int, partner_id);
            }

            request.input('arap_code', sql.NVarChar, data_obj['pnr_code'])
                .input('arap_name', sql.NVarChar, data_obj['pnr_name'])
                .input('arap_address', sql.NVarChar, data_obj['pnr_address'])
                .input('firm_id', sql.Int, params['firm_id'])
                .input('a_type_id', sql.Int, data_obj['pnr_type_id'])
                .input('a_status_id', sql.Int, data_obj['work_status_id'])
                .input('arap_shop_card_id', sql.NVarChar, is_exist ? data_row['arap_shop_card_id'] : empty)
                .input('acc_card_id', sql.Int, is_exist ? data_row['acc_card_id'] : 0)
                .input('salesman_id', sql.Int, is_exist ? data_row['salesman_id'] : 0)
                .input('spe_code', sql.NVarChar, is_exist ? data_row['spe_code'] : empty)
                .input('group_code', sql.NVarChar, is_exist ? data_row['group_code'] : empty)
                .input('security_code', sql.NVarChar, data_obj['pnr_category'])
                .input('work_group_code', sql.NVarChar, data_obj['pnr_complex'])
                .input('spe_code1', sql.NVarChar, is_exist ? data_row['spe_code1'] : empty)
                .input('spe_code2', sql.NVarChar, is_exist ? data_row['spe_code2'] : empty)
                .input('arap_lname', sql.NVarChar, is_exist ? data_row['arap_lname'] : empty)
                .input('arap_fname', sql.NVarChar, is_exist ? data_row['arap_fname'] : empty)
                .input('arap_mid_name', sql.NVarChar, is_exist ? data_row['arap_mid_name'] : empty)
                .input('arap_gender', sql.NVarChar, is_exist ? data_row['arap_gender'] : empty)
                .input('arap_birthdate', sql.DateTime, is_exist ? data_row['arap_birthdate'] : new Date(2000, 0))
                .input('arap_birthplace', sql.NVarChar, is_exist ? data_row['arap_birthplace'] : empty)
                .input('arap_nation', sql.NVarChar, is_exist ? data_row['arap_nation'] : empty)
                .input('arap_social_ent', sql.NVarChar, is_exist ? data_row['arap_social_ent'] : empty)
                .input('arap_edu_level', sql.NVarChar, is_exist ? data_row['arap_edu_level'] : empty)
                .input('edu_l_id', sql.Int, is_exist ? data_row['edu_l_id'] : 0)
                .input('arap_acad_level', sql.NVarChar, is_exist ? data_row['arap_acad_level'] : empty)
                .input('arap_acad_name', sql.NVarChar, is_exist ? data_row['arap_acad_name'] : empty)
                .input('arap_army_capable', sql.NVarChar, is_exist ? data_row['arap_army_capable'] : empty)
                .input('arap_army_level', sql.NVarChar, is_exist ? data_row['arap_army_level'] : empty)
                .input('arap_army_category', sql.NVarChar, is_exist ? data_row['arap_army_category'] : empty)
                .input('arap_army_type', sql.NVarChar, is_exist ? data_row['arap_army_type'] : empty)
                .input('arap_party_member', sql.NVarChar, is_exist ? data_row['arap_party_member'] : empty)
                .input('arap_tel_home', sql.NVarChar, data_obj['pnr_tel_home'])
                .input('arap_tel_work', sql.NVarChar, is_exist ? data_row['arap_tel_work'] : empty)
                .input('arap_tel_mobile1', sql.NVarChar, data_obj['pnr_tel_mob1'])
                .input('arap_tel_mobile2', sql.NVarChar, data_obj['pnr_tel_mob2'])
                .input('arap_tel_fax', sql.NVarChar, is_exist ? data_row['arap_tel_fax'] : empty)
                .input('arap_email1', sql.NVarChar, is_exist ? data_row['arap_email1'] : empty)
                .input('arap_email2', sql.NVarChar, is_exist ? data_row['arap_email2'] : empty)
                .input('arap_discount_perc', sql.Decimal, is_exist ? data_row['arap_discount_perc'] : 0)
                .input('arap_pasportno', sql.NVarChar, is_exist ? data_row['arap_pasportno'] : empty)
                .input('arap_city', sql.NVarChar, data_obj['pnr_city'])
                .input('arap_country', sql.NVarChar, is_exist ? data_row['arap_country'] : empty)
                .input('arap_postalcode', sql.NVarChar, is_exist ? data_row['arap_postalcode'] : empty)
                .input('arap_region', sql.NVarChar, data_obj['pnr_region'])
                .input('spe_code3', sql.NVarChar, is_exist ? data_row['spe_code3'] : empty)
                .input('spe_code4', sql.NVarChar, is_exist ? data_row['spe_code4'] : empty)
                .input('spe_code5', sql.NVarChar, is_exist ? data_row['spe_code5'] : empty)
                .input('spe_code6', sql.NVarChar, is_exist ? data_row['spe_code6'] : empty)
                .input('spe_code7', sql.NVarChar, is_exist ? data_row['spe_code7'] : empty)
                .input('spe_code8', sql.NVarChar, is_exist ? data_row['spe_code8'] : empty)
                .input('spe_code9', sql.NVarChar, is_exist ? data_row['spe_code9'] : empty)
                .input('spe_code10', sql.NVarChar, is_exist ? data_row['spe_code10'] : empty)
                .input('arap_long', sql.Float, data_obj['pnr_gps_longitude'])
                .input('arap_lat', sql.Float, data_obj['pnr_gps_latitude'])
                .input('div_id', sql.Int, data_obj['div_id'])
                .input('dept_id', sql.Int, data_obj['dept_id'])
                .input('arap_balance_limit', sql.Decimal, is_exist ? data_row['arap_balance_limit'] : 0)
                .input('Pr_ID', sql.Int, is_exist ? data_row['Pr_ID'] : 0)
                .input('arap_payrol_type', sql.Int, is_exist ? data_row['arap_payrol_type'] : 0)

            if (!is_exist)
                request.output('arap_id', sql.Int)

            return await request.execute(is_exist ? 'sp_mg_update_arap' : 'sp_mg_add_arap');

        }).then(async (result) => {
            if (!is_exist) {
                partner_id = result.output['arap_id'];
                const response = await DoMatchingInDB(partner_id, data_obj['partner_guid'], 'client');

                if (response.success) {
                    let query = `update tbl_mg_arap set arap_id_guid = '${data_obj['partner_guid']}' 
                                                                where arap_id = '${partner_id}'`;
                    let pool = await sql.connect(sqlConfig);
                    let result = await pool.request().query(query);

                    if (!CheckResObjKey(result) || result.rowsAffected[0] < 1) {
                        ResSend(res, httpSts.ServerError, 'Error update partner Guid => ',
                            query.replaceAll('\n', ''));
                        return;
                    }
                }
                else {
                    ResSend(res, httpSts.ServerError, 'Do matching error => ',
                        response.object);
                    return;
                }
            }

            ResSend(res, httpSts.Success, 'partner_identity:', partner_id);

        }).catch(err => {
            ResSend(res, httpSts.ServerError, 'Global error => ', `${err}`);
        })
    }
    else
        ResSend(res, httpSts.BadRequest, 'Get request params is empty!');
}

const AddDescription = async (req, res) => {
    //const params = req.body.parameters;
    const data_obj = req.body.data_obj[0];

    if (CheckObjOrArrForNull(data_obj)) {
        let empty = '', desc_id = -1, message = '';

        await sql.connect(sqlConfig).then(async (pool) => {
            const req = pool.request();

            req.input('fich_id', sql.Int, data_obj['desc_id'])
                .input('fich_code', sql.NVarChar, data_obj['desc_code'])
                .input('fich_date', sql.DateTime, data_obj['desc_datetime'])
                .input('fich_total', sql.Float, 0)
                .input('fich_type_id', sql.Int, data_obj['desc_type_id'])
                .input('arap_id', sql.Int, data_obj['partner_id'])
                .input('div_id', sql.Int, data_obj['div_id'])
                .input('dept_id', sql.Int, data_obj['dept_id'])
                .input('plant_id', sql.Int, 1)
                .input('wh_id', sql.Int, data_obj['whouse_id'])
                .input('p_id', sql.Int, 1)
                .input('inv_id', sql.Int, 0)
                .input('fich_desc', sql.NVarChar, data_obj['description'])
                .input('fich_discount', sql.Float, 0)
                .input('fich_nettotal', sql.Float, 0)
                .input('salesman_id', sql.Int, data_obj['seller_id'])
                .input('T_ID', sql.Int, 1) // USER ID
                .input('spe_code', sql.NVarChar, data_obj['desc_priority'])
                .input('group_code', sql.NVarChar, empty)
                .input('security_code', sql.NVarChar, empty)
                .input('payplan_id', sql.Int, 0)
                .input('ord_status_id', sql.Int, data_obj['desc_status_id'])
                .input('bank_acc_id_client', sql.Int, 0)
                .input('bank_acc_id_local', sql.Int, 0)
                .output('fich_id_iden', sql.Int)

            return await req.execute('sp_mg_add_order_fich');

        }).then(async (result) => {
            if (!CheckResObjKey(result)) {
                ResSend(res, httpSts.ServerError, 'Result is => ', result);
                return;
            }

            desc_id = result.output['fich_id_iden'];
            let response = await DoMatchingInDB(desc_id, data_obj['desc_file_id'], 'desc');

            if (response.success) {
                let query = `update tbl_mg_order_fich set fich_id_guid = '${data_obj['desc_file_id']}' 
                                                                        where fich_id = '${desc_id}'`;
                let pool = await sql.connect(sqlConfig);
                let result = await pool.request().query(query);

                if (!CheckResObjKey(result) || result.rowsAffected[0] < 1) {
                    message = 'Error update [ Description Guid ] => ';
                    ResSend(res, httpSts.ServerError, message, query.replaceAll('\n', ''));
                    return;
                }
            }
            else {
                message = 'Error insert [ Description Guid ] in do matching => ';
                ResSend(res, httpSts.ServerError, message, response.object);
                return;
            }

            ResSend(res, httpSts.Success, 'desc_identity:', desc_id);

        }).catch(err => {
            ResSend(res, httpSts.ServerError, 'Global error => ', `${err}`);
        })
    }
    else
        ResSend(res, httpSts.BadRequest, 'Get request params is empty!');
}

const SetDeviceSync = async (req, res) => {
    const data_obj = req.query; let props = ['device', 'udid', 'bt_level'];

    if (CheckObjProps(data_obj, props)) {
        await sql.connect(sqlConfig).then(async (pool) => {
            let query = `insert into tbl_br_device_sync(sync_id, device_code, device_udid, sync_date, sync_type, battery_level) 
                                   values(-1, @device, @udid, GETDATE(), 'Merkez', @bt_level); select @@ROWCOUNT as row_count`;

            const req = pool.request()
                .input('device', sql.NChar, data_obj['device'])
                .input('udid', sql.VarChar, data_obj['udid'])
                .input('bt_level', sql.Float, data_obj['bt_level']);
            return await req.query(query);

        }).then(async (result) => {
            if (!CheckResObjKey(result) && result.recordset[0]['row_count'] < 1) {
                ResSend(res, httpSts.ServerError, 'Result is => ', result);
                return;
            }

            ResSend(res, httpSts.Success, 'result:', result.recordset[0]['row_count']);

        }).catch(err => {
            ResSend(res, httpSts.ServerError, 'Global error => ', `${err}`);
        })
    }
    else
        ResSend(res, httpSts.BadRequest, 'Get request params is empty!');
}

const AddPhotoReport = async (req, res) => {
    const pr = req.file; // pr => photo_report
    const obj = JSON.parse(req.query.object);
    const params = obj.parameters;
    const data_obj = obj.data_obj;

    const imageBuffer = await ImageCompress(pr);
    if (imageBuffer !== false) {
        const file_path = pr.path.replace('Original', 'Compressed');
        // console.log('OBJ:', obj);
        // console.log('DATA:', data_obj);

        await sql.connect(sqlConfig).then(async (pool) => {
            let query = `begin if not exists (select * from tbl_br_photo_reports where file_name = @file_name)
                            begin insert into tbl_br_photo_reports(file_name, file_size, file_blob, file_path,
                            file_datetime, file_extention, partner_id, salesman_id, order_guid) values(@file_name,
                            @file_size, @file_blob, @file_path, @file_datetime, @file_extention, @partner_id,
                            @salesman_id, @order_guid); end end`;

            const req = pool.request()
                .input('file_name', sql.VarChar, pr.filename)
                .input('file_size', sql.Float, pr.size)
                .input('file_blob', sql.Image, imageBuffer)
                .input('file_path', sql.VarChar, file_path)
                .input('file_datetime', sql.DateTime, ConvertClientDateToUTC(params.datetime))
                .input('file_extention', sql.VarChar, pr.mimetype)
                .input('partner_id', sql.Int, data_obj['partner_id'])
                .input('salesman_id', sql.Int, data_obj['seller_id'])
                .input('order_guid', sql.UniqueIdentifier, data_obj['order_guid']);

            return await req.query(query);

        }).then(async (result) => {


            if (!CheckResObjKey(result) && result.rowsAffected[0] < 1) {
                ResSend(res, httpSts.ServerError, 'Result is => ', result);
                return;
            }

            ResSend(res, httpSts.Success, 'result:', params['file_name']);

        }).catch(err => {
            console.log(err)
            ResSend(res, httpSts.ServerError, 'Global error => ', `${err}`);
        });
    }
    else
        ResSend(res, httpSts.ServerError, 'Error compress photo report', params['file_name']);
}

module.exports =
{
    AddGpsData,
    AddUpdPartnerData,
    AddDescription,
    SetDeviceSync,
    AddPhotoReport
}