const express = require('express');
const homeController = require('~root/server/app/controller/v1.0/homeContorller');

const router = express.Router();

router.get('/', homeController.getHome);

module.exports = router;
