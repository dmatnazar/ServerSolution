SELECT
	l.material_id,
CASE
		
		WHEN SUM ( l.fich_line_amount * ISNULL ( unit_det_conv2, 1 ) ) - ISNULL ( vt.amount_in_whorder, 0 ) > 0 THEN
		SUM ( l.fich_line_amount * ISNULL ( unit_det_conv2, 1 ) ) ELSE 0 
	END AS not_shipped_amount,
	SUM ( l.fich_line_amount * ISNULL ( unit_det_conv2, 1 ) ) AS ord_real_amount 
FROM
	tbl_mg_order_fich_line l
	JOIN tbl_mg_order_fich f ON l.fich_id = f.fich_id
	LEFT JOIN tbl_mg_unit_det d ON l.unit_det_id = d.unit_det_id
	LEFT JOIN virtual_table vt ON l.material_id = vt.material_id 
WHERE
	fich_date >= GETDATE ( ) - 3 
	AND ord_status_id IN ( % 1 $s ) 
	AND fich_type_id = 12 % 2 $s 
GROUP BY
	l.material_id,
	vt.amount_in_whorder