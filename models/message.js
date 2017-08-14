var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')

var Schema = mongoose.Schema

var MessageSchema = Schema({
    uid: {
        type: String,
		required: true
    },
	newMail: {
		type: String,
		required: true
	},
	mail: {
		type: String,
	}
}, { collection: 'message', timestamps: true })


var Message = mongoose.model('Message', MessageSchema)

module.exports = Message