const express = require('express');
const router = express.Router();

//Import
const { GetMaterialsImgID, GetAllMaterials, GetMaterialImage,
        GetMaterialUnits, GetMaterialPrices, GetUnitAndDetails,
        GetGroups, GetAttributes, GetMtrlAttrUnit, GetLastPrices,
        GetCurrencyAndPrTypes, GetBarcodes } = require('../../Controllers/Get/materials.js');

let routes_array = ['mat_img_id', 'all_materials', 'material_image',
        'material_units', 'material_prices', 'unit_and_details',
        'groups', 'attributes', 'mtrl_attr_unit', 'last_prices',
        'currency_and_pr_types', 'barcodes'];

router.get('/', (req, res) => {
        // res.status(200).send(routes_array);
        res.render('index', {
                data: routes_array,
                type: 'get_materials',
                url: req.originalUrl,
        })
})

router.route(`/${routes_array[0]}`).get(GetMaterialsImgID);
router.route(`/${routes_array[1]}`).get(GetAllMaterials); // <<<<<<<<
router.route(`/${routes_array[2]}`).get(GetMaterialImage);
router.route(`/${routes_array[3]}`).get(GetMaterialUnits);
router.route(`/${routes_array[4]}`).get(GetMaterialPrices);

//-----------------------------------------------------------------

router.route(`/${routes_array[5]}`).get(GetUnitAndDetails);
router.route(`/${routes_array[6]}`).get(GetGroups);
router.route(`/${routes_array[7]}`).get(GetAttributes);
router.route(`/${routes_array[8]}`).get(GetMtrlAttrUnit);
router.route(`/${routes_array[9]}`).get(GetLastPrices);
router.route(`/${routes_array[10]}`).get(GetCurrencyAndPrTypes);
router.route(`/${routes_array[11]}`).get(GetBarcodes);

module.exports = router;