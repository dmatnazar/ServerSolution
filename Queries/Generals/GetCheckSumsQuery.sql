--save
WITH vtbl_checksum as
                    (
                        SELECT 'tbl_mg_firm' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_firm] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_arap' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_arap] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_order_status' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_order_status] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_order_fich' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_order_fich] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_order_fich_line' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_order_fich_line] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_materials' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_materials] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_units' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_units] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_unit_det' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_unit_det] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_group_codes' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_group_codes] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_specodes' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_specodes] WITH (NOLOCK)
                        UNION
                        SELECT 'tbl_mg_currency' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_currency] WITH (NOLOCK)
                        UNION                                    
                        SELECT 'tbl_mg_price_type' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_price_type] WITH (NOLOCK)
                        UNION                                    
                        SELECT 'tbl_mg_mat_price' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_mat_price] WITH (NOLOCK)
                        UNION                                    
                        SELECT 'tbl_mg_barcode' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_barcode] WITH (NOLOCK)
                        UNION                                    
                        SELECT 'tbl_mg_whouse' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_whouse] WITH (NOLOCK)
                        UNION                                    
                        SELECT 'tbl_mg_material_total' AS TABLE_NAME,
                        CHECKSUM_AGG(BINARY_CHECKSUM(*)) AS CHECK_SUM
                        FROM [dbo].[tbl_mg_material_total] WITH (NOLOCK)
                    )
                    SELECT v.TABLE_NAME, v.CHECK_SUM FROM tbl_br_checksum c
                    LEFT JOIN vtbl_checksum v on v.TABLE_NAME = c.table_name
                    WHERE (isnull(c.checksum_value, 0) <> v.CHECK_SUM or
                    DateDiff(HOUR, c.crt_upd_dt, GETDATE()) > 1)