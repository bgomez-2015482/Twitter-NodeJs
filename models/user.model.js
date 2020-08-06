'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    image: String,
    tweets: [
        { type: Schema.Types.ObjectId, ref: 'tweet' },
    ],
    followers: [
        { type: Schema.Types.ObjectId, ref: 'user' },
    ],
    retweet: {
        retweetId: String,
        retweetRef: { type: Schema.Types.ObjectId, ref: 'tweet' },
        comentContainer: String
    }
});

module.exports = mongoose.model('user', userSchema);