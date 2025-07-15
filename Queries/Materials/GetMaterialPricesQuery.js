const GetMaterialPricesQuery = `select m.material_id, m.unit_id, p.unit_det_id, p.price_code, cast(p.price_value AS DECIMAL (18,2)) AS price_value, p.a_status_id
                    as work_status_id, (CONVERT(varchar(10), p.price_start_date, 23) + ' ' + CONVERT(varchar(5), p.price_start_date, 108))
                    as begin_date, (CONVERT(varchar(10), p.price_end_date, 23) + ' ' + CONVERT(varchar(5), p.price_end_date, 108)) as end_date,
                    p.price_type_id as price_type, price_desc from tbl_mg_materials m join tbl_mg_mat_price p on
                    m.material_id = p.material_id where m_cat_id in (14,17) order by m.material_id, price_type`;

module.exports = { GetMaterialPricesQuery}