var express = require('express')
var jwt = require('jsonwebtoken')

var User = require('../models/user')
var config = require('../utils/config')

var router = express.Router()

// Register new users
router.post('/register', function(req, res) {

  const newUser = User({
    email: req.query.email,
    password: req.query.password
  })

  newUser.save(function(err) {
    if (err) return res.json({ success: false, message: 'Something went wrong, Try again.' })
    return res.json({ success: true, message: 'User successfully registered.'})
  })
})

// Authenticate User
router.post('/authenticate', function(req, res) {
  User.findOne({
    email: req.query.email
  }, function(err, user) {
    if (err) return res.json({ success: false, message: 'Something went wrong, Try again.' })
    if (!user) return res.json({ success: false, message: 'Authentication failed. User with this email doesnt exist.' })
    if (!user.comparePassword(req.query.password)) return res.json({ success: false, message: 'Incorrect Password.' })
    var token = jwt.sign(req.query, config.secret, {
      expiresIn: 10000
    })
    res.json({ success: true, token: 'JWT ' + token })
  })
})

router.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(err, data) {
		if (err) return res.send({ success: false, User: err })
		res.json({ success: true, message: {
        email: data.email,
        newEmail: data.newMail
      }
    })
	})
})

module.exports = router