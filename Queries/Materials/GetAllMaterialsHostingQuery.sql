SELECT 
        m.material_id AS mtrl_id_ak_hsp,
        LOWER(m.material_id_guid) AS mtrl_guid,
        m.material_code AS mtrl_code,
        m.material_name AS mtrl_name, 
        m.material_name AS mtrl_full_name,
        m.mat_brand_code AS mtrl_brand,
        CONCAT(m.material_description, '\n', m.material_description1) AS mtrl_desc,
        m.security_code AS mtrl_category,
        LOWER(u.unit_id_guid) AS unit_guid,
        CAST(m.mat_weight AS DECIMAL(18,2)) AS mtrl_weight,
        CAST(m.mat_width AS DECIMAL(18,2)) AS mtrl_width,
        CAST(m.mat_height AS DECIMAL(18,2)) AS mtrl_height,
        CAST(m.mat_length AS DECIMAL(18,2)) AS mtrl_volume,
        CASE m.a_status_id WHEN 1 THEN 0 WHEN 2 THEN 1 END AS mark_for_deletion
    FROM 
        tbl_mg_materials m 
        JOIN tbl_mg_units u ON m.unit_id = u.unit_id
    WHERE 
        m.a_status_id <> 3