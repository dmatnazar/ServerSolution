const GetMaterialsImgIDQuery = `select i.material_id, i.image_id, m.material_name from tbl_mg_images i
                    join tbl_mg_materials m on i.material_id = m.material_id and m.a_status_id
                    in (1,2)`;

module.exports = {GetMaterialsImgIDQuery}