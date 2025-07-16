SELECT
	lower( m.material_id_guid ) AS mtrl_guid,
	lower(
		isnull(
			s.spe_code_id_guid,
		CAST( 0x0 AS UNIQUEIDENTIFIER ))) AS attr_guid,
	lower(
		isnull(
			g.group_code_id_guid,
		CAST( 0x0 AS UNIQUEIDENTIFIER ))) AS group_guid,
	lower( d.unit_det_id_guid ) AS unit_det_guid,
	lower( f.firm_id_guid ) AS firm_guid,
CASE
		m.m_cat_id 
		WHEN 14 THEN
		1 
		WHEN 19 THEN
		2 
		WHEN 17 THEN
		3 
	END AS mtrl_type_row_id 
FROM
	tbl_mg_materials m
	JOIN tbl_mg_firm f ON m.firm_id = f.firm_id
	JOIN tbl_mg_unit_det d ON d.unit_id = m.unit_id
	LEFT JOIN tbl_mg_group_codes g ON g.group_code_name = m.group_code
	LEFT JOIN tbl_mg_specodes s ON s.spe_code_name = m.spe_code 
WHERE
	m.m_cat_id IN ( 14, 17, 19 ) 
ORDER BY
	mtrl_type_row_id