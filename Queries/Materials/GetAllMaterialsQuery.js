const GetAllMaterialsQuery = () => `
    SELECT 
        m.material_id,
        material_code AS mtrl_code,
        m.material_name AS mtrl_name, 
        mat_name_lang1 AS mtrl_desc,
        ISNULL(b.mat_barcode, '#') AS mtrl_barcode,
        ISNULL(m.group_code, '--n/a--') AS mtrl_group,
        ISNULL(m.spe_code, '--n/a--') AS mtrl_category,
        ISNULL(m.security_code, '--n/a--') AS mtrl_sub_category,
        unit_id,
        unit_det_id,
        m_cat_id AS raw_id,
        div_id,
        dept_id,
		CAST(mat_weight AS DECIMAL(18,2)) AS mtrl_weight,
		CAST(mat_height AS DECIMAL(18,2)) AS mtrl_height,
		CAST(mat_width AS DECIMAL(18,2)) AS mtrl_width,
		CAST(mat_length AS DECIMAL(18,2)) AS mtrl_length,
        a_status_id AS work_status_id,
        ISNULL(spe_code7, 0) AS mtrl_disc_active,
        CONVERT(VARCHAR(11), modify_date, 104) + ' ' + CONVERT(VARCHAR(8), modify_date, 108) AS modify_date
    FROM 
        tbl_mg_materials m 
        LEFT JOIN (
            SELECT DISTINCT material_id,
                MIN(bar_barcode) AS mat_barcode 
            FROM tbl_mg_barcode b 
                JOIN tbl_mg_unit_det d ON b.unit_det_id = d.unit_det_id AND d.unit_det_main = 1 
            GROUP BY material_id
        ) b ON m.material_id = b.material_id 
    WHERE 
        m_cat_id IN (14, 17)
    ORDER BY 
        m_cat_id, group_code, spe_code
`;

const GetAllMaterialsHostingQuery = () => `
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
`;

module.exports = {
    GetAllMaterialsQuery,
    GetAllMaterialsHostingQuery
};
