'use strict'

var mongoose = require('mongoose');
var port = 3800;
var app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/TwitterNodeJs', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log('Conexión a la base de datos correcta!');
        app.listen(port, () => {
            console.log('Servidor de express corriendo', port);
        });
    }).catch(err => {
        console.log('Error al conectarse', err);
    });