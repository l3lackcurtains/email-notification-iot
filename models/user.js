var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')

var Schema = mongoose.Schema

var userSchema = Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
}, { collection: 'user', timestamps: true })

var User = mongoose.model('User', userSchema)

module.exports = User