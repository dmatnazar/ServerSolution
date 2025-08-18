SELECT
	l.route_id,
	l.route_day AS day_of_week 
FROM
	tbl_mg_route_salesman_link l
	JOIN tbl_mg_route_plan p ON l.route_id = p.route_id 
WHERE
	p.salesman_id > 0