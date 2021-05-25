const express = require('express');
const authController = require('~root/server/app/controller/v1.0/authController');

const router = express.Router();

router.get('/callback', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
