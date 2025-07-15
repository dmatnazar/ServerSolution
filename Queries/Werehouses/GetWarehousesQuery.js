const GetWarehousesQuery = () => `
    DECLARE @main_wh_id INT;
    SELECT @main_wh_id = ISNULL(info_value, 0)
    FROM tbl_br_general_info
    WHERE info_name = 'MAIN_WAREHOUSE_ID';

    SELECT wh_id AS warehouse_id,
           wh_name AS warehouse_name,
           CASE isenabled WHEN 0 THEN 2 ELSE 1 END AS work_status_id,
           CASE WHEN wh_id = @main_wh_id THEN 1 ELSE 0 END AS is_main,
           div_id, dept_id
    FROM tbl_mg_whouse;
`;

const GetWarehousesHostingQuery = () => `
    SELECT wh_id AS wh_id_ak_hsp,
           LOWER(wh_id_guid) AS wh_guid,
           LOWER(f.firm_id_guid) AS firm_guid,
           wh_name,
           wh_index AS wh_sequence
    FROM tbl_mg_whouse w
    JOIN tbl_mg_firm f ON w.firm_id = f.firm_id;
`;

module.exports = {
    GetWarehousesQuery,
    GetWarehousesHostingQuery
};
