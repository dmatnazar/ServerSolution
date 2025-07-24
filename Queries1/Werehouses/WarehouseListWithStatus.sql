DECLARE @main_wh_id INT;
SELECT
	@main_wh_id = ISNULL ( info_value, 0 ) 
FROM
	tbl_br_general_info 
WHERE
	info_name = 'MAIN_WAREHOUSE_ID';
SELECT
	wh_id AS warehouse_id,
	wh_name AS warehouse_name,
CASE
		isenabled 
		WHEN 0 THEN
		2 ELSE 1 
	END AS work_status_id,
CASE
		
		WHEN wh_id = @main_wh_id THEN
		1 ELSE 0 
	END AS is_main,
	div_id,
	dept_id 
FROM
	tbl_mg_whouse