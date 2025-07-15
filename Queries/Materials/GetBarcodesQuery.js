const GetBarcodesQuery = `select lower(b.material_id_guid) as mtrl_guid,
                    lower(d.unit_det_id_guid) as unit_det_guid,
                    lower(b.bar_id_guid) as barcode_guid,
                    b.bar_barcode as barcode_value
                    from tbl_mg_barcode b
                    join tbl_mg_unit_det d on
                    d.unit_det_id = b.unit_det_id`;

module.exports = { GetBarcodesQuery };