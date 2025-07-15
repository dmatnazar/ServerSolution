const GetExecuteSP = () => `exec sp_mg_recalc_mat_totals;\n`;

const GetCalcOrdAmountQuery = () => `
    select l.material_id,
           case
               when sum(l.fich_line_amount * isnull(unit_det_conv2, 1)) - isnull(vt.amount_in_whorder, 0) > 0
               then sum(l.fich_line_amount * isnull(unit_det_conv2, 1))
               else 0
           end as not_shipped_amount,
           sum(l.fich_line_amount * isnull(unit_det_conv2, 1)) as ord_real_amount
    from tbl_mg_order_fich_line l
             join tbl_mg_order_fich f on l.fich_id = f.fich_id
             left join tbl_mg_unit_det d on l.unit_det_id = d.unit_det_id
             left join virtual_table vt on l.material_id = vt.material_id
    where fich_date >= GETDATE() - 3
      and ord_status_id in (%1$s)
      and fich_type_id = 12
      %2$s
    group by l.material_id, vt.amount_in_whorder
`;

const GetMainQuery = () => `
    with virtual_table as (
    select l.material_id,
           sum(isnull(l.mat_inv_quantity, 0) * isnull(unit_det_conv2, 1)) as amount_in_whorder
    from tbl_mg_mat_inv_head i
             join tbl_mg_mat_inv_line l on i.mat_inv_head_id = l.mat_inv_head_id
             left join tbl_mg_unit_det d ON d.unit_det_id = l.unit_det_id
    where i.group_code in (
        select distinct f.group_code
        from tbl_mg_order_fich f
        where f.ord_status_id = 6
          %1$s
          and f.fich_date >= GETDATE() - 3
          and f.fich_type_id = 12
    )
    group by l.material_id
)
select 
    m.material_id,
    t.wh_id as whouse_id,
    cast(mat_whousetotal_amount as decimal(18,2)) as stock_total_amount,
    cast(
        case
            when mat_whousetotal_amount > 0
                then mat_whousetotal_amount - isnull(o.not_shipped_amount, 0)
            else mat_whousetotal_amount
        end as decimal(18,2)
    ) as stock_after_action
from tbl_mg_materials m
         join tbl_mg_material_total t on m.material_id = t.material_id
         join tbl_mg_whouse w on t.wh_id = w.wh_id and w.isenabled = 1
         left join (
            select material_id,
                   sum(not_shipped_amount) as not_shipped_amount,
                   sum(ord_real_amount) as ord_real_amount
            from (
                     %2$s
                     union all
                     %3$s
                 ) as sbq
            group by material_id
    ) o on m.material_id = o.material_id
where m.m_cat_id in (14, 17)
  and t.wh_id <> -1
  and t.wh_id in (%4$s)

order by whouse_id, t.material_id

`;

module.exports = {
    GetExecuteSP,
    GetCalcOrdAmountQuery,
    GetMainQuery
};
