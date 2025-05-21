const express = require('express');
const router = express.Router();
const extraController = require('../controllers/ExtraController');

router.get('/', extraController.getAllExtras);
router.get('/:id', extraController.getExtraById);
router.post('/', extraController.createExtra);
router.put('/:id', extraController.updateExtra);
router.delete('/:id', extraController.deleteExtra);

module.exports = router;