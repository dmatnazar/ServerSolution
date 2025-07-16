SELECT DISTINCT
	lower( g.group_code_id_guid ) AS group_guid,
	m.group_code AS group_name 
FROM
	tbl_mg_materials m
	JOIN tbl_mg_group_codes g ON m.group_code = g.group_code 
WHERE
	g.group_code_type_id = 30 
	AND len ( m.group_code ) > 1 
ORDER BY
	m.group_code