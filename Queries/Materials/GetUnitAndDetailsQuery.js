const GetUnitsAndDetailsQuery = () => `
    SELECT unit_id AS unit_id_ak_hsp,
           LOWER(unit_id_guid) AS unit_guid,
           unit_code, unit_name 
    FROM tbl_mg_units
`;

const GetUnitsDetailsQuery = () => `
    SELECT unit_det_id AS unit_det_id_ak_hsp,
           LOWER(unit_det_id_guid) AS unit_det_guid,
           LOWER(unit_id_guid) AS unit_guid,
           unit_det_code, unit_det_name,
           CAST(unit_det_conv1 AS decimal(18,2)) AS unit_det_numerator,
           CAST(unit_det_conv2 AS decimal(18,2)) AS unit_det_dominator,
           unit_det_main AS is_unit_det_main
    FROM tbl_mg_unit_det
`;

module.exports = { GetUnitsAndDetailsQuery, GetUnitsDetailsQuery };