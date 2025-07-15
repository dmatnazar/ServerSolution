const express = require('express');
const router = express.Router();

//Import
const { GetOptions, GetFirmData, GetFirmLogo, GetPartners, GetSalesmans, 
        GetRoutePlans, GetUsingTargetPlans, GetRestrictionSettings,
        GetContacts, GetStatuses, GetCheckSums } = require('../../Controllers/Get/generals.js');

let routes_array = [ 'options', 'firm_data', 'firm_logo', 'partners', 'salesmans',
                  'route_plans', 'using_target', 'restr_settings', 'conventions',
                  'contacts', 'statuses', 'checksums'];

router.get('/', (req, res) => {
        res.render('index', {
                data: routes_array,
                type: 'get_generals',
                url: req.originalUrl,
        })
})

router.route(`/${ routes_array[0] }`).get(GetOptions);
router.route(`/${ routes_array[1] }`).get(GetFirmData); // <<<<<<<<
router.route(`/${ routes_array[2] }`).get(GetFirmLogo);
router.route(`/${ routes_array[3] }`).get(GetPartners); // <<<<<<<<
router.route(`/${ routes_array[4] }`).get(GetSalesmans); // ???????
router.route(`/${ routes_array[5] }`).get(GetRoutePlans);
router.route(`/${ routes_array[6] }`).get(GetUsingTargetPlans);
router.route(`/${ routes_array[7] }`).get(GetRestrictionSettings);
router.route(`/${ routes_array[8] }`).get(async (req, res) => 
{
        let guid_empty = '00000000-0000-0000-0000-000000000000';
        let array =
        {
                'convention_guid': guid_empty,
                'partner_guid': guid_empty,
                'convention_name': 'Ylalaşyk resminama ýok'
        }     
        res.status(200).send(new Array(array));
})

//-----------------------------------------------------------------

router.route(`/${ routes_array[9] }`).get(GetContacts);
router.route(`/${ routes_array[10] }`).get(GetStatuses);
router.route(`/${ routes_array[11] }`).get(GetCheckSums);

module.exports = router;