SELECT
	seller_id,
	CAST(
	SUM( trg_det_quantity ) AS DECIMAL ( 18, 2 )) AS target_quantity,
	CAST(
	SUM( sale_quantity ) AS DECIMAL ( 18, 2 )) AS sale_quantity,
	trg_plan_type_id AS target_type_id 
FROM
	(
	SELECT
		f.salesman_id AS seller_id,
		d.trg_det_quantity,
	CASE
			p.trg_plan_type_id 
			WHEN 1 THEN
			SUM(
				ISNULL( s.fich_line_nettotal, 0 )) - SUM(
				ISNULL( g.fich_line_nettotal, 0 )) ELSE SUM(
				ISNULL( s.fich_line_amount, 0 )) - SUM(
			ISNULL( g.fich_line_amount, 0 )) 
		END AS sale_quantity,
		p.trg_plan_type_id 
	FROM
		tbl_mg_fich f
		JOIN tbl_br_trg_det d ON f.salesman_id = d.salesman_id
		JOIN tbl_br_trg_plan p ON d.trg_plan_id = p.trg_plan_id
		LEFT JOIN tbl_mg_arap a ON d.salesman_id = a.salesman_id 
		AND a.a_type_id = 4
		LEFT JOIN (
		SELECT
			d.trg_det_id,
			ISNULL( material_id, 0 ) AS material_id 
		FROM
			tbl_br_trg_plan p
			JOIN tbl_br_trg_det d ON p.trg_plan_id = d.trg_plan_id
			LEFT JOIN tbl_br_trg_mat m ON d.trg_det_id = m.trg_det_id 
		WHERE
			p.trg_plan_status_id = 1 
		) m ON d.trg_det_id = m.trg_det_id
		LEFT JOIN tbl_mg_fich_line s ON f.fich_id = s.fich_id 
		AND f.fich_type_id = 8 
		AND s.material_id IN ( CASE p.trg_plan_is_mat WHEN 0 THEN s.material_id ELSE m.material_id END )
		LEFT JOIN tbl_mg_fich_line g ON f.fich_id = g.fich_id 
		AND f.fich_type_id = 3 
		AND g.material_id IN ( CASE p.trg_plan_is_mat WHEN 0 THEN g.material_id ELSE m.material_id END ) 
	WHERE
		p.trg_plan_status_id = 1 
		AND f.fich_date BETWEEN p.trg_plan_begin_dt 
		AND ( p.trg_plan_end_dt + 1 ) 
	GROUP BY
		f.salesman_id,
		p.trg_plan_name,
		trg_plan_begin_dt,
		trg_plan_end_dt,
		trg_plan_is_mat,
		a.arap_name,
		d.trg_det_quantity,
		p.trg_plan_type_id 
	) sbq 
GROUP BY
	seller_id,
	trg_plan_type_id