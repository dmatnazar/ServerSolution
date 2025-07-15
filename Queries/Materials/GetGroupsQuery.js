const GetGroupsQuery = `select distinct lower(g.group_code_id_guid) as group_guid,
                    m.group_code as group_name from tbl_mg_materials m
                    join tbl_mg_group_codes g on m.group_code = g.group_code
                    where g.group_code_type_id = 30 and len(m.group_code) > 1
                    order by m.group_code`;

module.exports = { GetGroupsQuery };