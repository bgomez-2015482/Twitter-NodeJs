'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'EncriptionK';

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'Petición sin autorización'
        });
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try {
            var payload = jwt.decode(token, key);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({
                    message: 'Token Expirado'
                });
            }
        } catch (ex) {
            return res.status(404).send({
                message: 'Token no valido'
            })
        }
        req.user = payload;
        next();
    }
}