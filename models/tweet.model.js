'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TweetSchema = Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'user' },
    content: String
});

module.exports = mongoose.model('tweet', TweetSchema);