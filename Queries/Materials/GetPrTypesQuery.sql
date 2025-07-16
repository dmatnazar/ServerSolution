SELECT
	lower( p.price_type_id_guid ) AS price_type_guid,
	p.price_type_name,
	( SELECT lower( currency_id_guid ) FROM tbl_mg_currency WHERE currency_name LIKE '%T%M%' ) AS pt_currency_guid,
CASE
		
		WHEN price_type_id IN ( 1, 3 ) THEN
		0 
		WHEN price_type_id IN ( 2, 4 ) THEN
		1 
	END AS pt_used_in_sale 
FROM
	tbl_mg_price_type p