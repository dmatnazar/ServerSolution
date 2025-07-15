const express = require('express')
const router = express.Router()

//Import
const Procedure = require('./procedure.js');
const Transaction = require('./transaction.js');

let routes_array = [ 'procedure', 'transaction' ];

router.get('/', (req, res) => {
    res.render('index', {
        data: routes_array,
        type: 'post_index',
        url: req.originalUrl,
      });
})

router.use(`/${ routes_array[0] }`, Procedure);
router.use(`/${ routes_array[1] }`, Transaction);

module.exports = router;