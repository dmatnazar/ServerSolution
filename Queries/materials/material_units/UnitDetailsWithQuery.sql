SELECT 
        unit_id,
        unit_det_id,
        unit_det_code,
        unit_det_name,
        CAST(unit_det_conv1 AS decimal(18,2)) AS unit_det_conv1,
        CAST(unit_det_conv2 AS decimal(18,2)) AS unit_det_conv2,
        unit_det_main,
        unit_det_bardigit AS unit_det_bar_digit
    FROM tbl_mg_unit_det