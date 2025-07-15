const express = require('express')
const router = express.Router()

//Import
// const InvoicesRoute = require('./invoices.js');
const MaterialsRoute = require('./materials.js');
const GeneralsRoute = require('./generals.js');
const WarehousesRoute = require('./warehouses.js');
const ReportsRoute = require('./reports.js');
const ExistenceCheckRoute = require('./existence_check.js');

const routes_array = [ 'invoices', 'materials', 'generals', 'warehouses',
                                 'existence_check', 'reports', 'others' ];
router.get('/', (req, res) => {
    res.render('index', {
        data: routes_array,
        type: 'get_index',
        url: req.originalUrl,
      });
})

router.use(`/${ routes_array[1] }`, MaterialsRoute);
router.use(`/${ routes_array[2] }`, GeneralsRoute);
router.use(`/${ routes_array[3] }`, WarehousesRoute);
router.use(`/${ routes_array[4] }`, ExistenceCheckRoute);
router.use(`/${ routes_array[5] }`, ReportsRoute);

module.exports = router;