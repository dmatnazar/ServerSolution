SELECT
	firm_id AS firm_id_ak_hsp,
	lower( firm_id_guid ) AS firm_guid,
	firm_name,
	firm_fullname AS firm_full_name,
	isnull( firm_fullname, firm_name ) AS name_for_print 
FROM
	tbl_mg_firm