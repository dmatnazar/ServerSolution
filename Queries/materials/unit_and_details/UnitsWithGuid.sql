SELECT unit_id AS unit_id_ak_hsp,
           LOWER(unit_id_guid) AS unit_guid,
           unit_code, unit_name 
    FROM tbl_mg_units
