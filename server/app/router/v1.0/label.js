const express = require('express');
const labelController = require('~root/server/app/controller/v1.0/labelController');

const router = express.Router();

router.get('/my', labelController.getMyLabels);
router.get('/labels', labelController.getLabels);
router.get('/:id', labelController.getLabel);
router.post('/create', labelController.createLabel);
router.put('/:id', labelController.updateLabel);
router.delete('/:id', labelController.deleteLabel);

module.exports = router;
