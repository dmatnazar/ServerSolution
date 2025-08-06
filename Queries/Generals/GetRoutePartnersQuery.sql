SELECT
	l.route_id,
	l.arap_id AS partner_id,
	LOWER( arap_id_guid ) AS partner_guid 
FROM
	tbl_mg_route_client_link l
	JOIN tbl_mg_arap a ON l.arap_id = a.arap_id
	JOIN tbl_mg_route_plan p ON l.route_id = p.route_id 
WHERE
	a.a_status_id IN ( 1 ) 
	AND p.salesman_id > 0