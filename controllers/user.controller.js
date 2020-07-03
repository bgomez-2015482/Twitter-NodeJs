"use strict";

var User = require("../models/user.model");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");
var Tweet = require("../models/tweet.model");
const tweetModel = require("../models/tweet.model");
const {
    param
} = require("../routes/user.route");

function comands(req, res) {
    var params = req.body;
    var review = params.option;
    var user = new User();

    switch (review) {
        case "Register":
            if (params.name && params.username && params.email && params.password) {
                User.findOne({
                        $or: [{
                                username: params.username,
                            },
                            {
                                email: params.email,
                            },
                        ],
                    },
                    (err, userFind) => {
                        if (err) {
                            res.status(500).send({
                                message: "Error general, intentelo más tarde",
                            });
                        } else if (userFind) {
                            res.send({
                                message: "Usuario o correo ya utilizado",
                            });
                        } else {
                            user.name = params.name;
                            user.username = params.username;
                            user.email = params.email;
                            user.role = "USER";

                            bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                                if (err) {
                                    res.status(500).send({
                                        message: "Error al encriptar contraseña",
                                    });
                                } else if (passwordHash) {
                                    user.password = passwordHash;
                                    user.save((err, userSaved) => {
                                        if (err) {
                                            res.status(500).send({
                                                message: "Error general al guardar usuario",
                                            });
                                        } else if (userSaved) {
                                            res.send({
                                                user: userSaved,
                                            });
                                        } else {
                                            res.status(404).send({
                                                message: "Usuario no guardado",
                                            });
                                        }
                                    });
                                } else {
                                    res.status(418).send({
                                        message: "Error inesperado",
                                    });
                                }
                            });
                        }
                    }
                );
            } else {
                res.send({
                    message: "Ingresa todos los datos",
                });
            }

            break;

        case "Login":
            if (params.username || params.email) {
                if (params.password) {
                    User.findOne({
                            $or: [{
                                    username: params.username,
                                },
                                {
                                    email: params.email,
                                },
                            ],
                        },
                        (err, check) => {
                            if (err) {
                                res.status(500).send({
                                    message: "Error general",
                                });
                            } else if (check) {
                                bcrypt.compare(
                                    params.password,
                                    check.password,
                                    (err, passworOk) => {
                                        if (err) {
                                            res.status(500).send({
                                                message: "Error al comparar",
                                            });
                                        } else if (passworOk) {
                                            if (params.gettoken == "true") {
                                                res.send({
                                                    token: jwt.createToken(check),
                                                    user: check.name,
                                                });
                                            } else {
                                                res.send({
                                                    message: "Error en el servidor al generar la autenticación",
                                                });
                                            }
                                        } else {
                                            res.send({
                                                message: "Contraseña incorrecta",
                                            });
                                        }
                                    }
                                );
                            } else {
                                res.send({
                                    message: "Datos de usuario incorrectos",
                                });
                            }
                        }
                    );
                } else {
                    res.send({
                        message: "Ingresa tu contraseña",
                    });
                }
            } else {
                res.send({
                    message: "Ingresa tu correo o tu username",
                });
            }

            break;
    }
}

function comandsSecurity(req, res) {
    var params = req.body;
    var review = params.option;
    var user = new User();
    var tweet = new Tweet();

    switch (review) {
        case "EDIT_USER":

            if (req.user.sub != params.userId) {
                res.status(403).send({
                    message: "Error de permisos, usuario no logueado",
                });
            } else {
                User.findByIdAndUpdate(
                    params.userId,
                    params, {
                        new: true,
                    },
                    (err, userUpdated) => {
                        if (err) {
                            res.status(500).send({
                                message: "Error general al actualizar",
                            });
                        } else if (userUpdated) {
                            res.send({
                                user: userUpdated,
                            });
                        } else {
                            res.status(404).send({
                                message: "No se ha podido actualizar",
                            });
                        }
                    }
                );
            }

            break;

        case "DELETE_USER":
            if (req.user.sub != params.userId) {
                res.status(403).send({
                    message: "Error de permisos, usuario no logueado",
                });
            } else {
                User.findByIdAndRemove(params.userId, (err, userRemoved) => {
                    if (err) {
                        res.status(500).send({
                            message: "Error general al actualizar",
                        });
                    } else if (userRemoved) {
                        res.send({
                            message: "Se ha eliminado el siguiente usuario: ",
                            user: userRemoved,
                        });
                    } else {
                        res.status(404).send({
                            message: "No se ha podido eliminar el usuario",
                        });
                    }
                });
            }

            break;

        case "PROFILE":
            User.findOne({
                username: params.username
            }, (err, showProfile) => {
                if (err)
                    return res.status(500).send({
                        message: "Error de petición"
                    });
                if (!showProfile)
                    return res.status(404).send({
                        message: "Error al mostrar datos"
                    });
                Tweet.populate(showProfile, {
                    path: 'tweets'
                }, (err, infoTweet) => {
                    if (err)
                        return res.status(500).send({
                            message: "Error de petición"
                        });
                    if (!infoTweet)
                        return res.status(404).send({
                            message: "Error al mostrar los tweet"
                        });
                    return res.status(200).send({
                        'Perfil': infoTweet
                    });
                });
            });

            break;

        case "ADD_TWEET":
            if (params.content) {
                tweet.creator = req.user.sub;
                tweet.content = params.content;
                tweet.save((err, saveTweet) => {
                    if (err)
                        return res.status(500).send({
                            message: "No se pudo agregar el tweet",
                        });
                    if (saveTweet) {
                        User.findByIdAndUpdate(req.user.sub, {
                            $push: {
                                tweets: saveTweet._id
                            }
                        }, {
                            new: true
                        }, (err, addNewTweet) => {
                            if (err)
                                return res.status(500).send({
                                    message: "Error de petición"
                                });
                            if (!addNewTweet)
                                return res.status(404).send({
                                    message: "No se pueden agregar los tweets"
                                });
                            return res.status(500).send({
                                message: saveTweet,
                            });
                        });
                    }
                });
            } else {
                res.status(500).send({
                    message: "Debe llenar todos los parametros",
                });
            }
            break;

        case "EDIT_TWEET":
            Tweet.findById(params.tweetId, (err, searchTweet) => {
                if (err)
                    return res.status(500).send({
                        message: "El tweet no existe",
                    });
                Tweet.findByIdAndUpdate(
                    params.tweetId,
                    params, {
                        new: true,
                    },
                    (err, tweetUpdated) => {
                        if (err) {
                            res.status(500).send({
                                message: "Error general al actualizar",
                            });
                        } else if (tweetUpdated) {
                            res.send({
                                tweet: tweetUpdated,
                            });
                        } else {
                            res.status(404).send({
                                message: "No se ha podido actualizar",
                            });
                        }
                    }
                );
            });
            break;

        case "DELETE_TWEET":
            Tweet.findById(params.tweetId, (err, deleteTweet) => {
                if (err)
                    return res.status(500).send({
                        message: "El tweet no existe",
                    });
                Tweet.findByIdAndRemove(
                    params.tweetId,
                    (err, tweetDeleted) => {
                        if (err)
                            return res.status(500).send({
                                message: "Error general al eliminar",
                            });
                        if (tweetDeleted) {
                            return res.send({
                                "Se ha eliminado el siguiente tweet": tweetDeleted,
                            });
                        } else {
                            res.status(400).send({
                                message: "No se ha podido eliminar el tweet"
                            });
                        }
                    }
                );
            });

    }
}

module.exports = {
    /*saveUser,
        login,
        updateUser,
        deleteUser,
        showProfile*/
    comands,
    comandsSecurity,
};