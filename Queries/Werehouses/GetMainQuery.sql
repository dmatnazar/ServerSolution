WITH virtual_table AS (
	SELECT
		l.material_id,
		SUM ( ISNULL ( l.mat_inv_quantity, 0 ) * ISNULL ( unit_det_conv2, 1 ) ) AS amount_in_whorder 
	FROM
		tbl_mg_mat_inv_head i
		JOIN tbl_mg_mat_inv_line l ON i.mat_inv_head_id = l.mat_inv_head_id
		LEFT JOIN tbl_mg_unit_det d ON d.unit_det_id = l.unit_det_id 
	WHERE
		i.group_code IN (
		SELECT DISTINCT
			f.group_code 
		FROM
			tbl_mg_order_fich f 
		WHERE
			f.ord_status_id = 6 % 1 $s 
			AND f.fich_date >= GETDATE ( ) - 3 
			AND f.fich_type_id = 12 
		) 
	GROUP BY
		l.material_id 
	) SELECT M
	.material_id,
	T.wh_id AS whouse_id,
	CAST ( mat_whousetotal_amount AS DECIMAL ( 18, 2 ) ) AS stock_total_amount,
	CAST ( CASE WHEN mat_whousetotal_amount > 0 THEN mat_whousetotal_amount - ISNULL ( o.not_shipped_amount, 0 ) ELSE mat_whousetotal_amount END AS DECIMAL ( 18, 2 ) ) AS stock_after_action 
FROM
	tbl_mg_materials
	M JOIN tbl_mg_material_total T ON M.material_id = T.material_id
	JOIN tbl_mg_whouse w ON T.wh_id = w.wh_id 
	AND w.isenabled = 1
	LEFT JOIN (
	SELECT
		material_id,
		SUM ( not_shipped_amount ) AS not_shipped_amount,
		SUM ( ord_real_amount ) AS ord_real_amount 
	FROM
		( % 2 $s UNION ALL % 3 $s ) AS sbq 
	GROUP BY
		material_id 
	) o ON M.material_id = o.material_id 
WHERE
	M.m_cat_id IN ( 14, 17 ) 
	AND T.wh_id <> - 1 
	AND T.wh_id IN ( % 4 $s ) 
ORDER BY
	whouse_id,
	T.material_id