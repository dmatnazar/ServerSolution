--save
SELECT * FROM (
    SELECT 
        LOWER(firm_id_guid) AS parent_guid, 
        contact_value, 
        CASE 
            WHEN attributes LIKE '%tel%' THEN 2 
            ELSE 1 
        END AS contact_type_id,
        CASE 
            WHEN attributes LIKE '%tel%1' THEN 'true' 
            ELSE 'false' 
        END AS is_contact_main
    FROM (
        SELECT 
            firm_id_guid, 
            CAST(firm_adres1 AS NVARCHAR) AS address1,
            CAST(firm_adres2 AS NVARCHAR) AS address2, 
            CAST(firm_phone AS NVARCHAR) AS tel_number 
        FROM tbl_mg_firm
    ) sbq 
    UNPIVOT (
        contact_value FOR attributes IN (tel_number, address1, address2)
    ) unpvt

    UNION ALL

    SELECT 
        LOWER(partner_guid) AS parent_guid, 
        contact_value, 
        CASE 
            WHEN attributes LIKE '%tel%' THEN 2 
            ELSE 1 
        END AS contact_type_id,
        CASE 
            WHEN attributes LIKE '%tel%1' THEN 'true' 
            ELSE 'false' 
        END AS is_contact_main
    FROM (
        SELECT 
            partner_guid, 
            partner_address, 
            partner_tel_home, 
            partner_tel_mob1,
            partner_tel_mob2 
        FROM v_br_partners_info 
        WHERE partner_type_id = 2
    ) sbq 
    UNPIVOT (
        contact_value FOR attributes IN (
            partner_tel_home, partner_tel_mob1, partner_tel_mob2, partner_address
        )
    ) unpvt
) sbq 
WHERE LEN(contact_value) > 2 AND parent_guid ${0} {1}