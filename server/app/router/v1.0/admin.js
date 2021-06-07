const express = require('express');
const adminController = require('~root/server/app/controller/v1.0/adminController');

const router = express.Router();

router.get('/users', adminController.getUsers);

module.exports = router;
