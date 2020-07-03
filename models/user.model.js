'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    role: String,
    image: String,
    tweets: [
        { type: Schema.Types.ObjectId, ref: 'tweet' },
    ]
});

module.exports = mongoose.model('user', userSchema);