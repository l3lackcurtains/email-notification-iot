var express = require('express')
var jwt = require('jsonwebtoken')
const notifier = require('mail-notifier')
var Inbox = require('../models/inbox')
var config = require('../utils/config')

var router = express.Router()

router.post('/inbox',(req, res) => {
	const newInbox = Inbox({
		from: req.body.from,
		date: req.body.date,
		subject: req.body.subject,
		body: req.body.body,
	})

	return newInbox.save((err) => {
		if (err) return res.json({ success: false, message: 'Something went wrong, Try again.', error: err })
		return res.json({ success: true, message: 'New inbox added.'})
	})
})


router.get('/inbox', (req, res) => {
	return Inbox.find().sort({ createdAt: -1 }).exec(function(err, data) {
    if (err) return res.send({ success: false, message: err })
		return res.json({ success: true, message: data})
	})
})


router.delete('/inbox', (req, res) => {
	return Inbox.db.db.dropCollection('inbox', (err, result) => {
		if(err) return res.send({ success: false, message: err })
		return res.json({ success: true, message: 'Deleted inbox successfully' })	
	})
	
})

module.exports = router