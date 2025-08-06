SELECT
	LOWER(firm_id_guid) AS firm_guid,
	s.salesman_id AS seller_id,
	a.arap_code AS seller_code,
	salesman_name AS seller_name,
	salesman_pass AS seller_password,
	a.arap_name AS seller_fullname,
	p.Pr_Name AS seller_profession,
	a.arap_tel_mobile1 AS seller_tel_mob1,
	a.arap_tel_mobile2 AS seller_tel_mob2,
	s.div_id,
	s.dept_id,
	s.ks_card_id AS cash_id,
	salesman_wh_id AS whouse_id,
	a.a_status_id AS work_status_id,
	app_mode_id,
	add_partner_data,
	upd_partner_data 
FROM
	tbl_mg_salesman s
	JOIN tbl_mg_firm f ON s.firm_id = f.firm_id
	JOIN tbl_mg_arap a ON s.salesman_id = a.salesman_id 
	AND a.a_type_id = 4
	LEFT JOIN tbl_br_app_access_ctrl c ON s.salesman_id = c.salesman_id
	JOIN Profession p ON a.Pr_ID = p.Pr_ID
	LEFT JOIN tbl_mg_kscards k ON s.ks_card_id = k.ks_card_id 
WHERE
	a.a_status_id IN ( 1 ) 
	AND (
		p.Pr_ID IN ( 10, 13 ) 
	OR ( p.Pr_ID IN ( 15, 26 ) AND k.acc_cat_id = 8 ) 
	)