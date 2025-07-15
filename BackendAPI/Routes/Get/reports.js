const express = require('express');
const router = express.Router();

//Import
const { GetSalesByMaterials } = require('../../Controllers/Get/reports.js');

let routes_array = [ 'sales_by_materials' ];

router.get('/', (req, res) => {
        res.render('index', {
                data: routes_array,
                type: 'get_report',
                url: req.originalUrl,
        })
})

router.route(`/${ routes_array[0] }`).get(GetSalesByMaterials);

module.exports = router;