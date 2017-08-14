
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt
var User = require('../models/user')
var config = require('./config')

module.exports = function(passport) {
	var options = {}
	options.jwtFromRequest = ExtractJwt.fromAuthHeader()
	options.secretOrKey = config.secret
	passport.use(new JwtStrategy(options, function(jwtPayload, done) {
		User.findOne({ id: jwtPayload.id }, function(err, user) {
			if (err) return done(err, false)
			if (!user) return done(null, false)
			return done(null, user)
		})
	}))
}