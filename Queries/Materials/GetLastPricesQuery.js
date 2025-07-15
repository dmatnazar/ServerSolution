const GetLastPricesQuery = `with vtbl_temp as(
                    select sbq.material_id, max(sbq.price_id)
                    as max_price_id, min(sbq.duration) as min_duration
                    from(
                        select price_id, material_id, unit_det_id, price_type_id,
                        datediff(day, price_start_date, price_end_date ) as duration 
                        from tbl_mg_mat_price where a_status_id = 1  
                        and price_start_date <= DATEADD( MINUTE, 5,
                        GETDATE()) and price_end_date >= GETDATE()) sbq
                        group by sbq.material_id, sbq.unit_det_id, sbq.price_type_id)
                    select lower(p.price_id_guid) as price_guid,
                    lower(t.price_type_id_guid) as price_type_guid,
                    lower(m.material_id_guid) as mtrl_guid,
                    lower(d.unit_det_id_guid) as unit_det_guid,
                    cast(p.price_value as decimal (18,2)) as price_value,
                    p.price_code, p.modify_date as price_date_time
                    from tbl_mg_mat_price p
                    join vtbl_temp v on p.price_id = v.max_price_id
                    join tbl_mg_currency c on p.currency_id = c.currency_id
                    join tbl_mg_price_type t on t.price_type_id = p.price_type_id
                    join tbl_mg_materials m on m.material_id = p.material_id
                    join tbl_mg_unit_det d on d.unit_det_id = p.unit_det_id`;

module.exports = { GetLastPricesQuery };