-- --save
-- WITH vtbl_checksum as
--                     (
--                         SELECT 'tbl_mg_firm' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_firm] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_arap' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_arap] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_order_status' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_order_status] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_order_fich' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_order_fich] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_order_fich_line' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_order_fich_line] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_materials' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_materials] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_units' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_units] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_unit_det' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_unit_det] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_group_codes' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_group_codes] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_specodes' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_specodes] WITH (NOLOCK)
--                         UNION
--                         SELECT 'tbl_mg_currency' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_currency] WITH (NOLOCK)
--                         UNION                                    
--                         SELECT 'tbl_mg_price_type' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_price_type] WITH (NOLOCK)
--                         UNION                                    
--                         SELECT 'tbl_mg_mat_price' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_mat_price] WITH (NOLOCK)
--                         UNION                                    
--                         SELECT 'tbl_mg_barcode' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_barcode] WITH (NOLOCK)
--                         UNION                                    
--                         SELECT 'tbl_mg_whouse' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_whouse] WITH (NOLOCK)
--                         UNION                                    
--                         SELECT 'tbl_mg_material_total' AS TABLE_NAME,
--                         CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
--                         FROM [dbo].[tbl_mg_material_total] WITH (NOLOCK)
--                     )
--                     SELECT v.TABLE_NAME, v.CHECK_SUM FROM tbl_br_pnr_checksum c
--                     LEFT JOIN vtbl_checksum v on v.TABLE_NAME = c.table_name
--                     WHERE (isnull(c.checksum_value, 0) <> v.CHECK_SUM or
--                     DateDiff(HOUR, c.crt_upd_dt, GETDATE()) > 1)

WITH vtbl_checksum AS (
    SELECT 'tbl_mg_firm' AS TABLE_NAME, CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
    FROM [dbo].[tbl_mg_firm] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_arap', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_arap] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_order_status', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_order_status] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_order_fich', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_order_fich] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_order_fich_line', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_order_fich_line] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_materials', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_materials] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_units', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_units] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_unit_det', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_unit_det] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_group_codes', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_group_codes] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_specodes', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_specodes] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_currency', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_currency] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_price_type', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_price_type] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_mat_price', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_mat_price] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_barcode', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_barcode] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_whouse', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_whouse] WITH (NOLOCK)
    UNION
    SELECT 'tbl_mg_material_total', CHECKSUM_AGG(BINARY_CHECKSUM(*)) FROM [dbo].[tbl_mg_material_total] WITH (NOLOCK)
)
SELECT
    v.TABLE_NAME,
    v.CHECK_SUM,
    c.checksum_value,
    c.checksum_id
FROM tbl_br_pnr_checksum c
LEFT JOIN vtbl_checksum v
    ON v.TABLE_NAME = 
        CASE c.checksum_id
            WHEN 1 THEN 'tbl_mg_firm'
            WHEN 2 THEN 'tbl_mg_arap'
            WHEN 3 THEN 'tbl_mg_order_status'
            WHEN 4 THEN 'tbl_mg_order_fich'
            WHEN 5 THEN 'tbl_mg_order_fich_line'
            WHEN 6 THEN 'tbl_mg_materials'
            WHEN 7 THEN 'tbl_mg_units'
            WHEN 8 THEN 'tbl_mg_unit_det'
            WHEN 9 THEN 'tbl_mg_group_codes'
            WHEN 10 THEN 'tbl_mg_specodes'
            WHEN 11 THEN 'tbl_mg_currency'
            WHEN 12 THEN 'tbl_mg_price_type'
            WHEN 13 THEN 'tbl_mg_mat_price'
            WHEN 14 THEN 'tbl_mg_barcode'
            WHEN 15 THEN 'tbl_mg_whouse'
            WHEN 16 THEN 'tbl_mg_material_total'
        END
WHERE ISNULL(c.checksum_value, 0) <> v.CHECK_SUM
