--save
BEGIN
    IF NOT EXISTS (SELECT 1 
                    FROM tbl_br_general_info 
                    WHERE info_name = 'ARAP_BALANCE')
    BEGIN
        INSERT INTO tbl_br_general_info (info_name, info_value, info_upd_time)
        VALUES ('ARAP_BALANCE', 'True', GETDATE());
    END

    SELECT
        partner_id,
        LOWER(partner_guid) AS partner_guid,
        partner_code AS pnr_code,
        partner_name AS pnr_name,
        CONCAT(partner_last_name, ' ', partner_first_name, ' ', partner_mid_name) AS pnr_fullname,
        partner_tel_home AS pnr_tel_home,
        partner_tel_mob1 AS pnr_tel_mob1,
        partner_tel_mob2 AS pnr_tel_mob2,
        partner_city AS pnr_city,
        partner_region AS pnr_region,
        partner_work_gr_code AS pnr_complex,
        partner_security_code AS pnr_category,
        partner_address AS pnr_address,
        CAST( partner_balance
            AS DECIMAL(18,2) ) pnr_balance,
        ISNULL(CAST(((pnr_oborot / 100) * 10) AS DECIMAL(18, 2)), 0) AS pnr_credit_limit,
        partner_type_id AS pnr_type_id,
        division_id AS div_id,
        department_id AS dept_id,
        work_status_id,
        ISNULL(partner_gps_latitude, 0) AS pnr_gps_latitude,
        ISNULL(partner_gps_longitude, 0) AS pnr_gps_longitude,
        CONVERT(VARCHAR(11), partner_crt_date, 104) + ' ' + CONVERT(VARCHAR(8), partner_crt_date, 108) AS pnr_crt_datetime,
        CONVERT(VARCHAR(11), partner_mdf_date, 104) + ' ' + CONVERT(VARCHAR(8), partner_mdf_date, 108) AS pnr_mdf_datetime 
    FROM
        v_br_partners_info P
        LEFT JOIN (
            SELECT arap_id, SUM(fich_nettotal) AS pnr_oborot 
            FROM tbl_mg_fich 
            WHERE fich_date >= GETDATE() - 14 
            GROUP BY arap_id
        ) o ON P.partner_id = o.arap_id
    WHERE
        partner_type_id = 2
        AND work_status_id IN (1);
END

