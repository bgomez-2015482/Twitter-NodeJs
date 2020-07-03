'use strict'
var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/comands', mdAuth.ensureAuth, userController.comands);

module.exports = api;