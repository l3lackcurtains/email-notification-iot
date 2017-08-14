var express = require('express')
var passport = require('passport')

var Message = require('../models/message')

var router = express.Router()

router
.get('/messages/:id', function(req, res) {
	Message.findOne({ uid: req.params.id }, function(err, data) {
		if (err) return res.send({ success: false, message: err })
		res.json({ success: true, message: data })
	})
})
.post('/messages', function(req, res) {
	var newMessage = new Message(req.query)
	newMessage.save(function(err, data) {
		if (err) return res.send({ success: false, message: err })
		res.json({ success: true, message: data })
	})
})
.put('/messages/:id', function(req, res) {
	Message.findByIdAndUpdate(req.params.id, { $set: req.query }, function(err, data) {
		if (err) return res.send({ success: false, message: err })
		Message.findById(data._id, function(err, updatedData) {
			res.json({ success: true, message: updatedData })
		})
	})
})

module.exports = router