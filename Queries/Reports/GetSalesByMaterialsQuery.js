const GetSalesByMaterialsQuery = (cond) => `SELECT m.material_id, m.material_code as mtrl_code, m.material_name as mtrl_name, d.unit_det_code,
                        isnull(m.group_code, '--n/a--') as mtrl_group, isnull(m.spe_code, '--n/a--') as mtrl_category,
                        isnull(m.security_code, '--n/a--') as mtrl_sub_category, isnull(s.sales_to_partners, 0) as
                        sales_to_partners, isnull(g.returns_to_partners, 0) as returns_to_partners,
                        isnull(s.sales_to_partners, 0) - isnull(g.returns_to_partners, 0) as sold_to_partners,
                        cast(isnull(s.sales_mat_amount, 0) as decimal(10, 2)) as sales_of_mtrls_in_amount,
                        cast(isnull(g.returns_mat_amount, 0) as decimal(10, 2)) as return_of_mtrls_in_amount,
                        cast(isnull(s.sales_mat_amount, 0) - isnull(g.returns_mat_amount, 0) as decimal(10, 2))
                        as sold_to_mtrls_in_amount,
                        case when isnull(s.sales_mat_amount, 0) - isnull(g.returns_mat_amount, 0) > 0
                        then cast((isnull(s.sales_nettotal, 0) - isnull(g.returns_nettotal, 0))/
                        (isnull(s.sales_mat_amount, 0) - isnull(g.returns_mat_amount, 0)) as decimal(18, 3))
                        else 0 end as sold_price_by_unit,
                        cast((isnull(s.sales_mat_amount, 0) * m.mat_weight) as decimal(10, 2)) as sales_of_mtrls_in_weight, 
                        cast((isnull(g.returns_mat_amount, 0) * m.mat_weight) as decimal(10, 2)) as return_of_mtrls_in_weight,
                        cast((isnull(s.sales_mat_amount, 0) - isnull(g.returns_mat_amount, 0)) * m.mat_weight as decimal(10, 2))
                        as sold_to_mtrls_in_weight,
                        cast(isnull(s.sales_nettotal, 0) as decimal(18, 3)) as sales_of_mtrls_by_sum, 
                        cast(isnull(g.returns_nettotal, 0) as decimal(18, 3)) as return_of_mtrls_by_sum,
                        cast(isnull(s.sales_nettotal, 0) - isnull(g.returns_nettotal, 0) as decimal(18, 3))
                        as sold_to_mtrls_by_sum FROM tbl_mg_materials m
                        JOIN tbl_mg_unit_det d on m.unit_det_id = d.unit_det_id
                        LEFT JOIN
                        (
                            SELECT l.material_id, count(distinct i.arap_id) as sales_to_partners,
                            cast(sum(l.fich_line_amount*d.unit_det_conv2) as decimal(10,2)) as 
                            sales_mat_amount, sum(l.fich_line_nettotal) as sales_nettotal
                            FROM tbl_mg_fich_line l JOIN tbl_mg_invoice i ON l.inv_id = i.inv_id
                            JOIN tbl_mg_unit_det d on l.unit_det_id = d.unit_det_id
                            WHERE i.inv_type_id = 8 and ${ cond } GROUP BY l.material_id
                        ) s on s.material_id = m.material_id
                        LEFT JOIN
                        (
                            SELECT l.material_id, count(distinct i.arap_id) as returns_to_partners,
                            cast(sum(l.fich_line_amount*d.unit_det_conv2) as decimal(10,2)) as 
                            returns_mat_amount, sum(l.fich_line_nettotal) as returns_nettotal
                            FROM tbl_mg_fich_line l JOIN tbl_mg_invoice i ON l.inv_id = i.inv_id
                            JOIN tbl_mg_unit_det d on l.unit_det_id = d.unit_det_id
                            WHERE i.inv_type_id = 3 and ${ cond } GROUP BY l.material_id
                        ) g on g.material_id = m.material_id
                        WHERE (isnull(s.sales_to_partners, 0) <> 0
                        or isnull(g.returns_to_partners, 0) <> 0)
                        ORDER BY group_code, spe_code`;

module.exports = { GetSalesByMaterialsQuery };
