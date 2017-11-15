var mongoose = require('mongoose')

var Schema = mongoose.Schema

var inboxSchema = Schema({
	from: {
		type: String,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
	subject: {
		type: String,
	},
	body: {
		type: String,
	},
}, { collection: 'inbox', timestamps: true })

var Inbox = mongoose.model('Inbox', inboxSchema)

module.exports = Inbox