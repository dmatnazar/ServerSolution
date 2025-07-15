const express = require('express');
const router = express.Router();

//Import
const { AddOrder, AddInvoice, AddMatInvoice,
        AddInvPayments } = require('../../Controllers/Post/transaction.js');

let routes_array = [ 'add_order', 'add_invoice', 'add_mat_invoice', 'add_inv_payments' ];
router.get('/', (req, res) => {
        res.render('index', {
                data: routes_array,
                type: 'post_transaction',
                url: req.originalUrl,
              });
})

router.route(`/${ routes_array[0] }`).post(AddOrder);
router.route(`/${ routes_array[1] }`).post(AddInvoice);
router.route(`/${ routes_array[2] }`).post(AddMatInvoice);
router.route(`/${ routes_array[3] }`).post(AddInvPayments);

module.exports = router;