SELECT
	i.material_id,
	i.image_id,
	m.material_name 
FROM
	tbl_mg_images i
	JOIN tbl_mg_materials m ON i.material_id = m.material_id 
	AND m.a_status_id IN (
	1,
	2)