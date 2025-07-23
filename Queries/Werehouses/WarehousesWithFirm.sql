SELECT
	wh_id AS wh_id_ak_hsp,
	LOWER ( wh_id_guid ) AS wh_guid,
	LOWER ( f.firm_id_guid ) AS firm_guid,
	wh_name,
	wh_index AS wh_sequence 
FROM
	tbl_mg_whouse w
	JOIN tbl_mg_firm f ON w.firm_id = f.firm_id;