SELECT 
    m.material_id, 
    m.material_code as mtrl_code, 
    m.material_name as mtrl_name, 
    d.unit_det_code,
    ISNULL(m.group_code, '--n/a--') as mtrl_group, 
    ISNULL(m.spe_code, '--n/a--') as mtrl_category,
    ISNULL(m.security_code, '--n/a--') as mtrl_sub_category, 
    ISNULL(s.sales_to_partners, 0) as sales_to_partners, 
    ISNULL(g.returns_to_partners, 0) as returns_to_partners,
    ISNULL(s.sales_to_partners, 0) - ISNULL(g.returns_to_partners, 0) as sold_to_partners,
    CAST(ISNULL(s.sales_mat_amount, 0) as decimal(10, 2)) as sales_of_mtrls_in_amount,
    CAST(ISNULL(g.returns_mat_amount, 0) as decimal(10, 2)) as return_of_mtrls_in_amount,
    CAST(ISNULL(s.sales_mat_amount, 0) - ISNULL(g.returns_mat_amount, 0) as decimal(10, 2)) as sold_to_mtrls_in_amount,
    CASE 
        WHEN ISNULL(s.sales_mat_amount, 0) - ISNULL(g.returns_mat_amount, 0) > 0 THEN 
            CAST((ISNULL(s.sales_nettotal, 0) - ISNULL(g.returns_nettotal, 0)) /
            (ISNULL(s.sales_mat_amount, 0) - ISNULL(g.returns_mat_amount, 0)) AS decimal(18, 3))
        ELSE 0 
    END as sold_price_by_unit,
    CAST((ISNULL(s.sales_mat_amount, 0) * m.mat_weight) AS decimal(10, 2)) as sales_of_mtrls_in_weight, 
    CAST((ISNULL(g.returns_mat_amount, 0) * m.mat_weight) AS decimal(10, 2)) as return_of_mtrls_in_weight,
    CAST((ISNULL(s.sales_mat_amount, 0) - ISNULL(g.returns_mat_amount, 0)) * m.mat_weight AS decimal(10, 2)) as sold_to_mtrls_in_weight,
    CAST(ISNULL(s.sales_nettotal, 0) AS decimal(18, 3)) as sales_of_mtrls_by_sum, 
    CAST(ISNULL(g.returns_nettotal, 0) AS decimal(18, 3)) as return_of_mtrls_by_sum,
    CAST(ISNULL(s.sales_nettotal, 0) - ISNULL(g.returns_nettotal, 0) AS decimal(18, 3)) as sold_to_mtrls_by_sum 
FROM tbl_mg_materials m
JOIN tbl_mg_unit_det d on m.unit_det_id = d.unit_det_id
LEFT JOIN (
    SELECT 
        l.material_id, 
        COUNT(DISTINCT i.arap_id) as sales_to_partners,
        CAST(SUM(l.fich_line_amount * d.unit_det_conv2) AS decimal(10,2)) as sales_mat_amount, 
        SUM(l.fich_line_nettotal) as sales_nettotal
    FROM tbl_mg_fich_line l 
    JOIN tbl_mg_invoice i ON l.inv_id = i.inv_id
    JOIN tbl_mg_unit_det d on l.unit_det_id = d.unit_det_id
    WHERE i.inv_type_id = 8 
        AND i.inv_date BETWEEN CAST({0} AS date) AND CAST({1} AS date)
        AND i.salesman_id = {2}
    GROUP BY l.material_id
) s on s.material_id = m.material_id
LEFT JOIN (
    SELECT 
        l.material_id, 
        COUNT(DISTINCT i.arap_id) as returns_to_partners,
        CAST(SUM(l.fich_line_amount * d.unit_det_conv2) AS decimal(10,2)) as returns_mat_amount, 
        SUM(l.fich_line_nettotal) as returns_nettotal
    FROM tbl_mg_fich_line l 
    JOIN tbl_mg_invoice i ON l.inv_id = i.inv_id
    JOIN tbl_mg_unit_det d on l.unit_det_id = d.unit_det_id
    WHERE i.inv_type_id = 3 
        AND i.inv_date BETWEEN CAST({0} AS date) AND CAST({1} AS date)
        AND i.salesman_id = {2}
    GROUP BY l.material_id
) g on g.material_id = m.material_id
WHERE (ISNULL(s.sales_to_partners, 0) <> 0 OR ISNULL(g.returns_to_partners, 0) <> 0)
ORDER BY m.group_code, m.spe_code;
