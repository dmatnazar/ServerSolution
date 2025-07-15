const GetMaterialImageQuery = (image_id) => `select image_pict, DATALENGTH(image_pict) as image_size 
                        from tbl_mg_images  where image_id = ${ image_id }`

module.exports = {GetMaterialImageQuery};