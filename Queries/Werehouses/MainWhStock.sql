WITH virtual_table AS (
    SELECT l.material_id, SUM(ISNULL(l.mat_inv_quantity, 0) * ISNULL(unit_det_conv2, 1)) AS amount_in_whorder
    FROM tbl_mg_mat_inv_head i 
    JOIN tbl_mg_mat_inv_line l ON i.mat_inv_head_id = l.mat_inv_head_id
    LEFT JOIN tbl_mg_unit_det d ON d.unit_det_id = l.unit_det_id
    WHERE i.group_code IN (
        SELECT DISTINCT f.group_code
        FROM tbl_mg_order_fich f 
        WHERE f.ord_status_id = 6 
            AND f.fich_date >= GETDATE()-3 
            AND f.fich_type_id = 12
    )
    GROUP BY l.material_id
)
SELECT 
    m.material_id, 
    t.wh_id AS whouse_id,
    CAST(mat_whousetotal_amount AS DECIMAL(18,2)) AS stock_total_amount,
CAST(
    CASE 
        WHEN mat_whousetotal_amount > 0 THEN mat_whousetotal_amount - ISNULL(o.not_shipped_amount, 0)
        ELSE mat_whousetotal_amount
    END AS DECIMAL(18,2)
) AS stock_after_action
FROM tbl_mg_materials m 
JOIN tbl_mg_material_total t ON m.material_id = t.material_id
JOIN tbl_mg_whouse w ON t.wh_id = w.wh_id AND w.isenabled = 1
LEFT JOIN (
    SELECT material_id, SUM(not_shipped_amount) AS not_shipped_amount
    FROM (
        SELECT l.material_id,
            CASE 
                WHEN SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1)) - ISNULL(vt.amount_in_whorder, 0) > 0
                THEN SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1)) 
                ELSE 0 
            END AS not_shipped_amount
        FROM tbl_mg_order_fich_line l
        JOIN tbl_mg_order_fich f ON l.fich_id = f.fich_id
        LEFT JOIN tbl_mg_unit_det d ON l.unit_det_id = d.unit_det_id
        LEFT JOIN virtual_table vt ON l.material_id = vt.material_id
        WHERE fich_date >= GETDATE()-3 
            AND ord_status_id IN (1, 5, 6)
            AND fich_type_id = 12
        GROUP BY l.material_id, vt.amount_in_whorder
    ) sbq
    GROUP BY material_id
) o ON m.material_id = o.material_id
WHERE m.m_cat_id IN (14, 17) 
    AND t.wh_id <> -1 
    AND t.wh_id IN ({0})
ORDER BY whouse_id, t.material_id;
