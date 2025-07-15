const GetMtrlAttrUnitQuery = `select lower(m.material_id_guid) as mtrl_guid,
                    lower(isnull(s.spe_code_id_guid, CAST(0x0 AS UNIQUEIDENTIFIER))) as attr_guid,
                    lower(isnull(g.group_code_id_guid, CAST(0x0 AS UNIQUEIDENTIFIER))) as group_guid,
                    lower(d.unit_det_id_guid) as unit_det_guid, lower(f.firm_id_guid) as firm_guid,
                    case m.m_cat_id when 14 then 1 when 19 then 2 when 17 then 3 end as mtrl_type_row_id
                    from tbl_mg_materials m join tbl_mg_firm f on m.firm_id = f.firm_id
                    join tbl_mg_unit_det d on d.unit_id = m.unit_id
                    left join tbl_mg_group_codes g on g.group_code_name = m.group_code
                    left join tbl_mg_specodes s on s.spe_code_name = m.spe_code
                    where m.m_cat_id in (14, 17, 19)
                    order by mtrl_type_row_id`;

module.exports = { GetMtrlAttrUnitQuery };