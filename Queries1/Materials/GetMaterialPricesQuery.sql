SELECT
	m.material_id,
	m.unit_id,
	p.unit_det_id,
	p.price_code,
	cast(
	p.price_value AS DECIMAL ( 18, 2 )) AS price_value,
	p.a_status_id AS work_status_id,
	(
	CONVERT ( VARCHAR ( 10 ), p.price_start_date, 23 ) + ' ' + CONVERT ( VARCHAR ( 5 ), p.price_start_date, 108 )) AS begin_date,
	(
	CONVERT ( VARCHAR ( 10 ), p.price_end_date, 23 ) + ' ' + CONVERT ( VARCHAR ( 5 ), p.price_end_date, 108 )) AS end_date,
	p.price_type_id AS price_type,
	price_desc 
FROM
	tbl_mg_materials m
	JOIN tbl_mg_mat_price p ON m.material_id = p.material_id 
WHERE
	m_cat_id IN ( 14, 17 ) 
ORDER BY
	m.material_id,
	price_type