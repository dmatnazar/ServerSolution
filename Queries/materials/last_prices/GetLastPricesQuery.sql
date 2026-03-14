WITH vtbl_temp AS (
	SELECT
		sbq.material_id,
		max( sbq.price_id ) AS max_price_id,
		min( sbq.duration ) AS min_duration 
	FROM
		(
		SELECT
			price_id,
			material_id,
			unit_det_id,
			price_type_id,
			datediff( DAY, price_start_date, price_end_date ) AS duration 
		FROM
			tbl_mg_mat_price 
		WHERE
			a_status_id = 1 
		AND price_start_date <= DATEADD ( MINUTE, 5, GETDATE ()) AND price_end_date >= GETDATE ()) sbq 
	GROUP BY
		sbq.material_id,
		sbq.unit_det_id,
		sbq.price_type_id 
	) SELECT
	lower( p.price_id_guid ) AS price_guid,
	lower( t.price_type_id_guid ) AS price_type_guid,
	lower( m.material_id_guid ) AS mtrl_guid,
	lower( d.unit_det_id_guid ) AS unit_det_guid,
	cast(
	p.price_value AS DECIMAL ( 18, 3 )) AS price_value,
	p.price_code,
	p.modify_date AS price_date_time 
FROM
	tbl_mg_mat_price p
	JOIN vtbl_temp v ON p.price_id = v.max_price_id
	JOIN tbl_mg_currency c ON p.currency_id = c.currency_id
	JOIN tbl_mg_price_type t ON t.price_type_id = p.price_type_id
	JOIN tbl_mg_materials m ON m.material_id = p.material_id
	JOIN tbl_mg_unit_det d ON d.unit_det_id = p.unit_det_id