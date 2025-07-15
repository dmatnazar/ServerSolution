const express = require('express');
const router = express.Router();

//Import
const { AddGpsData, AddUpdPartnerData, AddDescription,
        SetDeviceSync, AddPhotoReport } = require('../../Controllers/Post/procedure.js');
const { ImageUploader } = require('../../../Common/functions.js')

const ImgUploader = ImageUploader();

let routes_array = ['add_gps_data', 'add_upd_pnr_data', 'add_description',
  'set_device_sync', 'add_photo_report'];
router.get('/', (req, res) => {
  res.render('index', {
    data: routes_array,
    type: 'post_procedure',
    url: req.originalUrl,
  });
})

router.route(`/${routes_array[0]}`).post(AddGpsData);
router.route(`/${routes_array[1]}`).post(AddUpdPartnerData);
router.route(`/${routes_array[2]}`).post(AddDescription);
router.route(`/${routes_array[3]}`).get(SetDeviceSync);
router.post(`/${routes_array[4]}`, ImgUploader.single('photo_report'), AddPhotoReport);

module.exports = router;