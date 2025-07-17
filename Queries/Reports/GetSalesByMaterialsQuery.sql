SELECT
	m.material_id,
	m.material_code AS mtrl_code,
	m.material_name AS mtrl_name,
	d.unit_det_code,
	isnull( m.group_code, '--n/a--' ) AS mtrl_group,
	isnull( m.spe_code, '--n/a--' ) AS mtrl_category,
	isnull( m.security_code, '--n/a--' ) AS mtrl_sub_category,
	isnull( s.sales_to_partners, 0 ) AS sales_to_partners,
	isnull( g.returns_to_partners, 0 ) AS returns_to_partners,
	isnull( s.sales_to_partners, 0 ) - isnull( g.returns_to_partners, 0 ) AS sold_to_partners,
	cast(
	isnull( s.sales_mat_amount, 0 ) AS DECIMAL ( 10, 2 )) AS sales_of_mtrls_in_amount,
	cast(
	isnull( g.returns_mat_amount, 0 ) AS DECIMAL ( 10, 2 )) AS return_of_mtrls_in_amount,
	cast(
	isnull( s.sales_mat_amount, 0 ) - isnull( g.returns_mat_amount, 0 ) AS DECIMAL ( 10, 2 )) AS sold_to_mtrls_in_amount,
CASE
		
		WHEN isnull( s.sales_mat_amount, 0 ) - isnull( g.returns_mat_amount, 0 ) > 0 THEN
		cast((
				isnull( s.sales_nettotal, 0 ) - isnull( g.returns_nettotal, 0 ))/ (
			isnull( s.sales_mat_amount, 0 ) - isnull( g.returns_mat_amount, 0 )) AS DECIMAL ( 18, 3 )) ELSE 0 
	END AS sold_price_by_unit,
	cast((
			isnull( s.sales_mat_amount, 0 ) * m.mat_weight 
		) AS DECIMAL ( 10, 2 )) AS sales_of_mtrls_in_weight,
	cast((
			isnull( g.returns_mat_amount, 0 ) * m.mat_weight 
		) AS DECIMAL ( 10, 2 )) AS return_of_mtrls_in_weight,
	cast((
		isnull( s.sales_mat_amount, 0 ) - isnull( g.returns_mat_amount, 0 )) * m.mat_weight AS DECIMAL ( 10, 2 )) AS sold_to_mtrls_in_weight,
	cast(
	isnull( s.sales_nettotal, 0 ) AS DECIMAL ( 18, 3 )) AS sales_of_mtrls_by_sum,
	cast(
	isnull( g.returns_nettotal, 0 ) AS DECIMAL ( 18, 3 )) AS return_of_mtrls_by_sum,
	cast(
	isnull( s.sales_nettotal, 0 ) - isnull( g.returns_nettotal, 0 ) AS DECIMAL ( 18, 3 )) AS sold_to_mtrls_by_sum 
FROM
	tbl_mg_materials m
	JOIN tbl_mg_unit_det d ON m.unit_det_id = d.unit_det_id
	LEFT JOIN (
	SELECT
		l.material_id,
		count( DISTINCT i.arap_id ) AS sales_to_partners,
		cast(
		sum( l.fich_line_amount * d.unit_det_conv2 ) AS DECIMAL ( 10, 2 )) AS sales_mat_amount,
		sum( l.fich_line_nettotal ) AS sales_nettotal 
	FROM
		tbl_mg_fich_line l
		JOIN tbl_mg_invoice i ON l.inv_id = i.inv_id
		JOIN tbl_mg_unit_det d ON l.unit_det_id = d.unit_det_id 
	WHERE
		i.inv_type_id = 8 
		AND $ { 0 } 
	GROUP BY
		l.material_id 
	) s ON s.material_id = m.material_id
	LEFT JOIN (
	SELECT
		l.material_id,
		count( DISTINCT i.arap_id ) AS returns_to_partners,
		cast(
		sum( l.fich_line_amount * d.unit_det_conv2 ) AS DECIMAL ( 10, 2 )) AS returns_mat_amount,
		sum( l.fich_line_nettotal ) AS returns_nettotal 
	FROM
		tbl_mg_fich_line l
		JOIN tbl_mg_invoice i ON l.inv_id = i.inv_id
		JOIN tbl_mg_unit_det d ON l.unit_det_id = d.unit_det_id 
	WHERE
		i.inv_type_id = 3 
		AND $ { 0 } 
	GROUP BY
		l.material_id 
	) g ON g.material_id = m.material_id 
WHERE
	( isnull( s.sales_to_partners, 0 ) <> 0 OR isnull( g.returns_to_partners, 0 ) <> 0 ) 
ORDER BY
	group_code,
	spe_code