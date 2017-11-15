var express = require('express')
var jwt = require('jsonwebtoken')
const notifier = require('mail-notifier')
var Email = require('../models/email')
var config = require('../utils/config')

var router = express.Router()

router.post('/emails', (req, res) => {
	const newEmail = Email({
		email: req.body.email,
	})
	return newEmail.save((err) => {
		if (err) return res.json({ success: false, message: 'Something went wrong, Try again.', error: err })
		return res.json({ success: true, message: 'Email added successfully.'})
	})

})

router.delete('/emails/:id', (req, res) => {
	return Email.findByIdAndRemove(req.params.id, (err, data) => {
		if (err) {
			return res.json({ success: false, message: 'Unable to delete email.' })
		}
		return res.json({ success: true, message: 'Email deleted successfully.' })
	});
})


router.get('/emails', (req, res) => {
	return Email.find({}, 'email', (err, data) => {
    if (err) return res.send({ success: false, message: err })
		return res.json({ success: true, message: data})
	})
})

module.exports = router