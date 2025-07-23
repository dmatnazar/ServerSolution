SELECT
	info_name AS option_name,
	info_value AS option_value 
FROM
	tbl_br_general_info 
WHERE
	info_name NOT IN (
	'ONLINE_SYNC_STATUS')