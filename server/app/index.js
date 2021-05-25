/* eslint global-require:0 */
const express = require('express');
const path = require('path');
const http404 = require('~server/module/errorHandler/http404');
const http500 = require('~server/module/errorHandler/http500');
const errorMiddleware = require('~server/module/errorHandler/errorMiddleware');

module.exports = (app) => {
  /*
  指定static files目錄，可直接指向某個路徑，如：
  app.use(express.static(path.join(__dirname, '../public')));

  若是要指定某個route，也可以：
  app.use('/css', express.static(path.join(__dirname, '../../static/css')));
  */
  app.use(express.static(path.join(__dirname, '../public')));
  app.use((req, res, next) => {
    const lang = req.acceptsLanguages('zh', 'en') || 'en';
    res.locals.__lang = lang;

    next();
  });

  // 套用router
  require('./router/v1.0')(app);

  // 套用http404處理controller
  app.use(http404);
  // 在500之前加入自行定義的錯誤處理middleware
  app.use(errorMiddleware);
  app.use(http500);
};
