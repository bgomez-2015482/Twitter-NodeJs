'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'user' },
    content: String,
    like: Number,
    userLike: { type: Schema.Types.ObjectId, ref: 'user' },
    coment: {
        comentId: { type: Schema.Types.ObjectId, ref: 'user' },
        comentContainer: String
    }
});

module.exports = mongoose.model('tweet', TweetSchema);