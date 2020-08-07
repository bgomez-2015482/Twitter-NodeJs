'use strict';

var User = require("../models/user.model");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");
var Tweet = require("../models/tweet.model");

const userMaster = {
    name: "Admin",
    username: "bigAdmin",
    email: "admin@gmail.com",
    password: "3bd5665729"
};

var saveMaster = new User(userMaster);

//TOKEN PRINCIPAL, USAR PARA PETICIÓN MASTER (REGISTER, LOGIN)

let tokenMaster = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ZjI4NWYyYzQ4YTdiZjE1OTg4YjM3ZmUiLCJuYW1lIjoiQWRtaW4iLCJ1c2VybmFtZSI6ImJpZ0FkbWluIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJpYXQiOjE1OTY0ODEzNzMsImV4cCI6MTYwNDI1NzM3M30.ooZZ1PzXBit-omao9y7nB7NS63Pm6pv5NXw2x2hNYqA";


function comands(req, res) {
    var oneLine = req.body.action;
    var params = oneLine.split('-');
    var review = params[0].toUpperCase();
    var user = new User();
    var tweet = new Tweet();

    if (saveMaster && saveMaster.length >= 1) {

    } else {
        bcrypt.hash(userMaster.password, null, null, (err, passwordHash) => {
            saveMaster.password = passwordHash;
        });
        saveMaster.save();
    }

    switch (review) {

        case "REGISTER":
            if (params[1] && params[2] && params[3] && params[4]) {
                User.findOne({
                        $or: [{
                                username: params[2],
                            },
                            {
                                email: params[3],
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
                            user.name = params[1];
                            user.username = params[2];
                            user.email = params[3];

                            bcrypt.hash(params[4], null, null, (err, passwordHash) => {
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

        case "LOGIN":

            if (params[1] || params[1]) {
                if (params[2]) {
                    User.findOne({
                            $or: [{
                                    username: params[1],
                                },
                                {
                                    email: params[1],
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
                                    params[2],
                                    check.password,
                                    (err, passworOk) => {
                                        if (err) {
                                            res.status(500).send({
                                                message: "Error al comparar",
                                            });
                                        } else if (passworOk) {
                                            if (params[3] == "true") {
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
                username: params[1]
            }, (err, showProfile) => {
                if (err)
                    return res.status(500).send({
                        message: "Error de petición"
                    });
                if (!showProfile)
                    return res.status(404).send({
                        message: "El usuario no existe"
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
            if (params[1]) {
                tweet.creator = req.user.sub;
                tweet.content = params[1];
                tweet.like = 0;
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

        case "LIKE":
            Tweet.findById(params[1], (err, searchTweets) => {
                if (err)
                    return res.status(500).send({
                        message: "El tweet no existe"
                    });
                if (!searchTweets)
                    return res.status(404).send({
                        message: "El tweet no existe"
                    });
                User.findById(searchTweets.creator, (err, searchUsers) => {
                    if (err)
                        return res.status(500).send({
                            message: "El usuario no existe"
                        });
                    if (!searchUsers)
                        return res.status(404).send({
                            message: "No se puede obtener el usuario"
                        });
                    User.findOne({
                        followers: req.user.sub
                    }, (err, comparing) => {
                        User.populate(req.user.sub, {
                            path: 'followers'
                        }, (err, compared) => {
                            if (err)
                                return res.status(500).send({
                                    message: "Necesita seguir al usuario para esta acción"
                                });
                            if (!compared)
                                return res.status(404).send({
                                    message: "Error al mostrar tweet"
                                });
                            var follow = searchUsers.followers;
                            if (follow = comparing) {
                                Tweet.findOne({
                                    userLike: req.user.sub
                                }, (err, searchLike) => {
                                    if (searchLike) {
                                        return res.status(500).send({
                                            message: 'Ya ha dado like'
                                        });
                                    } else {
                                        var counter = searchTweets.like;
                                        Tweet.findByIdAndUpdate(params[1], {
                                            like: counter + 1,
                                            $push: {
                                                userLike: req.user.sub
                                            }
                                        }, {
                                            new: true
                                        }, (err, likeUpdated) => {
                                            if (err)
                                                return res.status(500).send({
                                                    message: 'Error en la petición Like'
                                                });
                                            if (!likeUpdated)
                                                return res.status(404).send({
                                                    message: 'No se pueden agregar los like'
                                                });
                                            return res.status(200).send({
                                                message: likeUpdated
                                            });
                                        });
                                    }
                                });
                            } else {
                                res.status(500).send({
                                    message: "Necesita seguir al usuario para realizar un like"
                                });
                            }
                        });
                    });
                });
            });
            break;


        case "DISLIKE_TWEET":
            Tweet.findById(params[1], (err, searchTweets) => {
                if (err)
                    return res.status(500).send({
                        message: 'El tweet no eiste'
                    });
                if (!searchTweets)
                    return res.status(404).send({
                        message: 'No se puede obtener el tweet'
                    });
                User.findById(searchTweets.creator, (err, searchUsers) => {
                    if (err)
                        return res.status(500).send({
                            message: 'El usuario no existe'
                        });
                    if (!searchUsers)
                        return res.status(404).send({
                            message: 'No se puede obtener el usuario'
                        });
                    User.findOne({
                        followers: req.user.sub
                    }, (err, comparing) => {
                        User.populate(req.user.sub, {
                            path: 'followers'
                        }, (err, compared) => {
                            if (err)
                                return res.status(500).send({
                                    message: 'Necesita seguir al usuario para esta acción'
                                });
                            if (!compared)
                                return res.status(404).send({
                                    message: 'Error al mostrar tweet'
                                });
                            var follow = searchUsers.followers;
                            if (follow = comparing) {
                                Tweet.findOne({
                                    userLike: req.user.sub
                                }, (err, searchLike) => {
                                    if (searchLike) {
                                        var counter = searchTweets.like;
                                        Tweet.findByIdAndUpdate(params[1], {
                                            like: counter - 1,
                                            $pull: {
                                                userLike: req.user.sub
                                            }
                                        }, {
                                            new: true
                                        }, (err, likeUpdated) => {
                                            if (err)
                                                return res.status(500).send({
                                                    message: 'Error en la petición like'
                                                });
                                            if (!likeUpdated)
                                                return res.status(404).send({
                                                    message: 'No se pueden remover los like'
                                                });
                                            return res.status(200).send({
                                                'Se ha removido el like del siguiente tweet: ': likeUpdated
                                            });
                                        });
                                    } else {
                                        return res.status(500).send({
                                            message: 'No ha dado like para removerlo'
                                        });
                                    }
                                });
                            } else {
                                res.status(500).send({
                                    message: "Necesita seguir al usuario para remover un like"
                                });
                            }
                        });
                    });
                });
            });
            break;

        case "REPLY_TWEET":
            Tweet.findById(params[1], (err, searchTweet) => {
                if (err)
                    return res.status(500).send({
                        message: 'El tweet no existe'
                    });
                Tweet.findByIdAndUpdate(params[1], {
                    $push: {
                        coment: {
                            comentId: req.user.sub,
                            comentContainer: params[2]
                        }
                    }
                }, {
                    new: true
                }, (err, searchTweet) => {
                    if (err)
                        res.status(500).send({
                            message: 'Error al actualizar'
                        });
                    if (searchTweet)
                        return res.status(200).send({
                            message: searchTweet
                        });
                });
            });
            break;

        case "REPLY_TWEET":
            Tweet.findById(params[1], (err, searchTweet) => {
                if (err)
                    return res.status(500).send({
                        message: 'El tweet no existe'
                    });
                Tweet.findByIdAndUpdate(params[1], {
                    $push: {
                        coment: {
                            comentId: req.user.sub,
                            comentContainer: params[2]
                        }
                    }
                }, {
                    new: true
                }, (err, searchTweet) => {
                    if (err)
                        res.status(500).send({
                            message: 'Error al actualizar'
                        });
                    if (searchTweet)
                        return res.status(200).send({
                            message: searchTweet
                        });
                });
            });
            break;

        case "RETWEET":
            Tweet.findById(params[1], (err, searchTweet) => {
                if (err)
                    return res.status(500).send({
                        message: 'El tweet no existe'
                    });
                var counter = searchTweet.creator + '1';
                User.findByIdAndUpdate(req.user.sub, {
                    $pull: {
                        retweet: {
                            retweetId: counter
                        }
                    }
                }, {
                    new: true
                }, (err, searchUser) => {
                    if (err)
                        res.status(500).send({
                            message: 'Error al actualizar'
                        });
                });
                if (params[2] == null) {
                    User.findByIdAndUpdate(req.user.sub, {
                        $push: {
                            retweet: {
                                retweetId: counter,
                                retweetRef: params[1]
                            }
                        }
                    }, {
                        new: true
                    }, (err, updateTweet) => {
                        if (err)
                            return res.status(500).send({
                                message: 'Error al actualizar'
                            });
                        return res.status(200).send({
                            message: updateTweet
                        });
                    });
                } else {
                    User.findByIdAndUpdate(req.user.sub, {
                        $push: {
                            retweet: {
                                retweetId: counter,
                                retweetRef: params[1],
                                comentContainer: params[2]
                            }
                        }
                    }, {
                        new: true
                    }, (err, updateTweet) => {
                        if (err)
                            return res.status(500).send({
                                message: 'Error al actualizar'
                            });
                        return res.status(200).send({
                            message: updateTweet
                        });
                    });
                }

            });
            break;

        case "EDIT_TWEET":
            Tweet.findById(params[1], (err, searchTweet) => {
                if (err)
                    return res.status(500).send({
                        message: 'El tweet no existe'
                    });
                Tweet.findByIdAndUpdate(
                    params[1], {
                        content: params[2]
                    }, {
                        new: true,
                    },
                    (err, tweetUpdated) => {
                        if (err) {
                            res.status(500).send({
                                message: 'Error general al actualizar',
                            });
                        } else if (tweetUpdated) {
                            res.send({
                                tweet: tweetUpdated,
                            });
                        } else {
                            res.status(404).send({
                                message: 'No se ha podido actualizar',
                            });
                        }
                    }
                );
            });
            break;

        case "DELETE_TWEET":
            Tweet.findById(params[1], (err, deleteTweet) => {
                if (err)
                    return res.status(500).send({
                        message: 'El tweet no existe',
                    });
                Tweet.findByIdAndRemove(
                    params[1],
                    (err, tweetDeleted) => {
                        if (err)
                            return res.status(500).send({
                                message: "Error general al eliminar",
                            });
                        if (!tweetDeleted) {
                            res.status(404).send({
                                message: "El tweet ya ha sido eliminado"
                            });
                        }
                        User.findByIdAndUpdate(req.user.sub, {
                            $pull: {
                                tweets: params[1]
                            }
                        }, {
                            new: true
                        }, (err, newTweetDeleted) => {
                            if (err)
                                res.status(500).send({
                                    message: "Error de petición"
                                });
                            if (!newTweetDeleted) {
                                res.status(500).send({
                                    message: "No se puede eliminar la referencia"
                                });
                            }
                            if (tweetDeleted) {
                                return res.status(200).send({
                                    "Se ha eliminado el siguiente tweet": tweetDeleted,
                                });
                            }
                        });
                    }
                );
            });
            break;

        case "VIEW_TWEETS":
            User.find({
                username: params[1]
            }, { _id: true }, (err, searchUser) => {
                if (err)
                    return res.status(500).send({
                        message: "Error de petición User"
                    });
                if (!searchUser)
                    return res.status(404).send({
                        message: "Error al mostrar datos en User"
                    });
                var search = searchUser;
                Tweet.find({ creator: search }, (err, showTweet) => {
                    if (err)
                        return res.status(500).send({
                            message: 'Error de petición es Tweet'
                        });
                    if (!showTweet)
                        return res.status(404).send({
                            message: "Error al mostrar datos en Tweet"
                        });
                    User.find({ username: params[1] }, { 'retweet': true }, (err, Retweets) => {
                        if (err)
                            return res.status(500).send({
                                message: "Error al buscar usuario"
                            });
                        if (!Retweets)
                            return res.status(500).send({
                                message: "Error al mostrar usuarios"
                            });
                        return res.status(500).send({
                            'Tweets': showTweet ||
                                Retweets
                        });
                    });
                });
            });
            break;

        case "FOLLOW":
            User.findOne({
                username: params[1]
            }, {
                _id: true
            }, (err, newFollower) => {
                if (err)
                    return res.status(500).send({
                        message: "Error de petición"
                    });
                if (!newFollower) {
                    return res.status(404).send({
                        message: "Error al mostrar datos"
                    });
                }
                User.findByIdAndUpdate(newFollower, {
                    $push: {
                        followers: req.user.sub
                    }
                }, {
                    new: true
                }, (err, addNewFollow) => {
                    if (err)
                        return res.status(500).send({
                            message: "Error de petición"
                        });
                    if (!addNewFollow)
                        return res.status(500).send({
                            message: "No se pueden agregar seguidores"
                        });
                    return res.status(200).send({
                        message: addNewFollow
                    });
                });
            });
            break;

        case "UNFOLLOW":
            User.findOne({
                username: params[1]
            }, {
                _id: true
            }, (err, removeFollower) => {
                if (err)
                    return res.status(500).send({
                        message: "Error al buscar el usuario"
                    });
                if (!removeFollower) {
                    return res.status(404).send({
                        message: "Error al mostrar datos"
                    });
                }
                User.findByIdAndUpdate(removeFollower, {
                    $pull: {
                        followers: req.user.sub
                    }
                }, {
                    new: true
                }, (err, newRemoveFollower) => {
                    if (err)
                        res.status(500).send({
                            message: "Error de petición"
                        });
                    if (!newRemoveFollower)
                        res.status(500).send({
                            message: "No se puede dejar de seguir"
                        });
                    return res.status(200).send({
                        "Se ha dejado de seguir al siguiente usuaio": newRemoveFollower
                    });
                });
            });
            break;

    }
}


module.exports = {
    comands
};