WITH virtual_table AS (
	SELECT
		l.material_id,
		SUM(ISNULL(l.mat_inv_quantity, 0) * ISNULL(unit_det_conv2, 1)) AS amount_in_whorder
	FROM
		tbl_mg_mat_inv_head i
		JOIN tbl_mg_mat_inv_line l ON i.mat_inv_head_id = l.mat_inv_head_id
		LEFT JOIN tbl_mg_unit_det d ON d.unit_det_id = l.unit_det_id
	WHERE
		i.group_code IN (
			SELECT DISTINCT f.group_code
			FROM tbl_mg_order_fich f
			WHERE
				f.ord_status_id = 6
				AND f.fich_date >= GETDATE() - 3
				AND f.fich_type_id = 12
				AND f.wh_id = {0}
		)
	GROUP BY
		l.material_id
)

SELECT
	m.material_id,
	dbo.fn_br_get_mat_stock_by_date({0}, m.material_id, GETDATE() + 1, 0) AS stock_total_amount,
	CAST(
		CASE
			WHEN dbo.fn_br_get_mat_stock_by_date({0}, m.material_id, GETDATE() + 1, 0) > 0 THEN
				dbo.fn_br_get_mat_stock_by_date({0}, m.material_id, GETDATE() + 1, 0) - ISNULL(o.not_shipped_amount, 0)
			ELSE
				dbo.fn_br_get_mat_stock_by_date({0}, m.material_id, GETDATE() + 1, 0)
		END AS DECIMAL(18, 2)
	) AS stock_after_action
FROM
	tbl_mg_materials m
	LEFT JOIN (
		SELECT
			material_id,
			SUM(not_shipped_amount) AS not_shipped_amount,
			SUM(ord_real_amount) AS ord_real_amount
		FROM (
			SELECT
				l.material_id,
				CASE
					WHEN SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1)) - ISNULL(vt.amount_in_whorder, 0) > 0 THEN
						SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1))
					ELSE 0
				END AS not_shipped_amount,
				SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1)) AS ord_real_amount
			FROM
				tbl_mg_order_fich_line l
				JOIN tbl_mg_order_fich f ON l.fich_id = f.fich_id
				LEFT JOIN tbl_mg_unit_det d ON l.unit_det_id = d.unit_det_id
				LEFT JOIN virtual_table vt ON l.material_id = vt.material_id
			WHERE
				f.fich_date >= GETDATE() - 3
				AND f.ord_status_id IN (1, 5)
				AND f.fich_type_id = 12
			GROUP BY
				l.material_id,
				vt.amount_in_whorder

			UNION ALL

			SELECT
				l.material_id,
				CASE
					WHEN SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1)) - ISNULL(vt.amount_in_whorder, 0) > 0 THEN
						SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1))
					ELSE 0
				END AS not_shipped_amount,
				SUM(l.fich_line_amount * ISNULL(unit_det_conv2, 1)) AS ord_real_amount
			FROM
				tbl_mg_order_fich_line l
				JOIN tbl_mg_order_fich f ON l.fich_id = f.fich_id
				LEFT JOIN tbl_mg_unit_det d ON l.unit_det_id = d.unit_det_id
				LEFT JOIN virtual_table vt ON l.material_id = vt.material_id
			WHERE
				f.fich_date >= GETDATE() - 3
				AND f.ord_status_id IN (6)
				AND f.fich_type_id = 12
			GROUP BY
				l.material_id,
				vt.amount_in_whorder
		) AS sbq
		GROUP BY material_id
	)o ON m.material_id = o.material_id
WHERE
	dbo.fn_br_get_mat_stock_by_date({0} m.material_id, GETDATE() + 1, 0) > 0;
