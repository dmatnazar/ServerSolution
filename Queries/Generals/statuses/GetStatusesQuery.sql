SELECT
	lower( ord_status_id_guid ) AS status_guid,
	ord_status_id AS status_id_ak_hsp,
	ord_status_name AS status_name,
CASE
		
		WHEN ord_status_id IN ( 1, 7, 9 ) THEN
		1 ELSE 0 
	END AS edit_ord_allowed 
FROM
	tbl_mg_order_status 
WHERE
	ord_status_id NOT IN ( 4, 10, 11, 105 ) 
	AND ord_status_id < 107