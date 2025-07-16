SELECT
	lower( b.material_id_guid ) AS mtrl_guid,
	lower( d.unit_det_id_guid ) AS unit_det_guid,
	lower( b.bar_id_guid ) AS barcode_guid,
	b.bar_barcode AS barcode_value 
FROM
	tbl_mg_barcode b
	JOIN tbl_mg_unit_det d ON d.unit_det_id = b.unit_det_id