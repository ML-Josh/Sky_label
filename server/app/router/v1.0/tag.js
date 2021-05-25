const express = require('express');
const tagController = require('~root/server/app/controller/v1.0/tagController');

const router = express.Router();

router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
