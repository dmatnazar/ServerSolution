const GetAttributesQuery = `select distinct lower(s.spe_code_id_guid)
                    as attribute_guid, m.spe_code as attribute_name
                    from tbl_mg_materials m
                    join tbl_mg_specodes s on m.spe_code = s.spe_code
                    where s.spe_code_type_id = 30 and len(m.spe_code) > 1
                    order by m.spe_code`;

module.exports = { GetAttributesQuery };