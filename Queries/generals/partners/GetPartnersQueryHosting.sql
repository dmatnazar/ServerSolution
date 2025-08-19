SELECT
	partner_id AS partner_id_ak_hsp,
	LOWER( partner_guid ) AS partner_guid,
	LOWER( f.firm_id_guid ) AS firm_guid,
	partner_code,
	partner_name,
	CONCAT( partner_last_name, ' ', partner_first_name, ' ', partner_mid_name ) AS partner_full_name,
	ISNULL( dbo.fn_mg_get_client_startbalance ( partner_id, CAST( GETDATE () AS DATE )), 0 ) AS partner_balance,
CASE
		work_status_id 
		WHEN 1 THEN
		0 
		WHEN 2 THEN
		1 
	END AS mark_for_deletion 
FROM
	v_br_partners_info v
	JOIN tbl_mg_firm f ON v.firm_id = f.firm_id 
WHERE
	partner_type_id = 2 
	AND work_status_id <> 3