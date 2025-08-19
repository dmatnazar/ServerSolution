SELECT
	firm_id,
	LOWER( firm_id_guid ) AS firm_guid,
	firm_name,
	firm_fullname AS firm_desc,
	firm_phone AS firm_tel_work1,
	firm_phone AS firm_tel_work2,
	firm_adres1 AS firm_address 
FROM
	tbl_mg_firm