const express = require('express');
const router = express.Router();

//Import
const { IsExistPartner, IsExistInvoice, IsExistMatInvoice,
        IsExistDeviceInfo, IsExistDescription 
} = require('../../Controllers/Get/existence_check.js');

let routes_array = [ 'partner', 'invoice', 'mat_invoice', 'device_info', 'description'];
router.get('/', (req, res) => {
        res.render('index', {
                data: routes_array,
                type: 'get_existence_check',
                url: req.originalUrl,
        })
})

router.route(`/${ routes_array[0] }`).get(IsExistPartner);
router.route(`/${ routes_array[1] }`).get(IsExistInvoice);
router.route(`/${ routes_array[2] }`).get(IsExistMatInvoice);
router.route(`/${ routes_array[3] }`).get(IsExistDeviceInfo);
router.route(`/${ routes_array[4] }`).get(IsExistDescription);

module.exports = router;