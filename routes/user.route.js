'use strict'
var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveUser', userController.saveUser);
api.post('/login', userController.login);
api.put('/update/:id', mdAuth.ensureAuth, userController.updateUser);
api.delete('/delete/:id', mdAuth.ensureAuth, userController.deleteUser);
api.get('/profile/:id', mdAuth.ensureAuth, userController.showProfile);

module.exports = api;