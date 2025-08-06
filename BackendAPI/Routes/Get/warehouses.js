const express = require('express');
const router = express.Router();

//Import
const { GetWarehouses, GetPersonalStock, GetStockByWhouse
} = require('../../Controllers/Get/warehouses.js');

let routes_array = [ 'werehouse_data', 'personal_stock', 'stock_by_whouse'];
router.get('/', (req, res) => {
        res.render('index', {
                data: routes_array,
                type: 'get_werehouses',
                url: req.originalUrl,
        })
})

router.route(`/${ routes_array[0] }`).get(GetWarehouses);
router.route(`/${ routes_array[1] }`).get(GetPersonalStock);
router.route(`/${ routes_array[2] }`).get(GetStockByWhouse);

module.exports = router;