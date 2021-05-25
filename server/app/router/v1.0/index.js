const express = require('express');
const config = require('~root/server/config');

const router = express.Router();
const jwtAutoRefresh = require('~server/app/middleware/jwtAutoRefresh');

/*
如果需要cors，可使用﹕

const skCors = require('~server/app/middleware/skCors');

const cors = skCors(['http://localhost:8080']);
router.options('/api/v1.0', cors);
router.use('/api/v1.0', cors);
*/

/*
如果需要rate limite，可使用：

const skRateLimit = require('~server/app/middleware/skRatelimit');

const limiter = skRateLimit({ windowMs: 1000 * 60, max: 60 });
// 套用ratelimit (整個path會被一起算)
router.use('/api/v1.0/account', limiter);
*/

// 以下將其他router或controller接上
router.use('/api/v1.0/auth', jwtAutoRefresh({ cookieName: '__SKLT', cookieOptions: { maxAge: 86400000 }, secret: config.JWT_SECRET }), require('./auth'));

router.use('/api/v1.0/label', jwtAutoRefresh({ cookieName: '__SKLT', cookieOptions: { maxAge: 86400000 }, secret: config.JWT_SECRET }), require('./label'));

router.use('/api/v1.0/category', jwtAutoRefresh({ cookieName: '__SKLT', cookieOptions: { maxAge: 86400000 }, secret: config.JWT_SECRET }), require('./category'));

router.use('/api/v1.0', jwtAutoRefresh({ cookieName: '__SKLT', cookieOptions: { maxAge: 86400000 }, secret: config.JWT_SECRET }), require('./home'));

module.exports = (app) => { app.use(router); };
