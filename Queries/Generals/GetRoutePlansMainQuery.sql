SELECT
	p.route_id,
	p.salesman_id AS seller_id,
	p.route_code,
	p.route_name,
	p.div_id,
	p.dept_id 
FROM
	tbl_mg_route_plan p
	JOIN ( SELECT route_id, COUNT( arap_id ) AS arap_count FROM tbl_mg_route_client_link GROUP BY route_id ) l ON p.route_id = l.route_id 
WHERE
	l.arap_count > 0 
	AND p.salesman_id > 0