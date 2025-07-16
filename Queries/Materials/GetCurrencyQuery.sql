SELECT
	lower( currency_id_guid ) AS currency_guid,
	currency_name AS currency_code,
	currency_descriptions AS currency_name 
FROM
	tbl_mg_currency