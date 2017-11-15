var express = require('express')
var jwt = require('jsonwebtoken')
const notifier = require('mail-notifier')
var User = require('../models/user')
var config = require('../utils/config')

var router = express.Router()

router.post('/users', (req, res) => {
  const imap = {
    user: req.body.email,
    password: req.body.password,
    host: "imap.gmail.com",
    port: 993, 
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  }
  const n = notifier(imap)
  return n.on('connected', () => {
    const newUser = User({
      email: req.body.email,
      password: req.body.password
    })
    return User.find({}, 'email', (err, data) => {
      if(!!data) User.collection.drop()
      return newUser.save((err) => {
        if (err) return res.json({ success: false, message: 'Something went wrong, Try again.', error: err })
        return res.json({ success: true, message: 'User successfully registered.'})
      })
    })
  })
    .on('error', (err) => {
      return res.json({ success: false, message: 'The login credentials is invalid.', error: err })
    }).start()
})

router.delete('/users', (req, res) => {
  return User.find({}, 'email', (err, data) => {
    if(data) return User.collection.drop()
    return res.json({ success: true, message: 'Deleted user successfully' })
	})	
})


router.get('/users', (req, res) => {
	return User.find({}, 'email', (err, data) => {
    if (err) return res.send({ success: false, message: err })
		return res.json({ success: true, message: data[0]})
	})
})

module.exports = router