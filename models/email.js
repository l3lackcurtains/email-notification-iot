var mongoose = require('mongoose')

var Schema = mongoose.Schema

var emailSchema = Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
}, { collection: 'email', timestamps: true })

var Email = mongoose.model('Email', emailSchema)

module.exports = Email