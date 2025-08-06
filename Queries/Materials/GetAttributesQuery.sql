SELECT DISTINCT
	lower( s.spe_code_id_guid ) AS attribute_guid,
	m.spe_code AS attribute_name 
FROM
	tbl_mg_materials m
	JOIN tbl_mg_specodes s ON m.spe_code = s.spe_code 
WHERE
	s.spe_code_type_id = 30 
	AND len ( m.spe_code ) > 1 
ORDER BY
	m.spe_code