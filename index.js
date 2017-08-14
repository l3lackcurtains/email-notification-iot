var express = require('express')

var Imap = require('imap'),
		inspect = require('util').inspect
var mongoose = require('mongoose')
var passport = require('passport')
var app = express()

var server = require('http').Server(app)

var io = require('socket.io')(server)

var User = require('./models/user')
var Message = require('./models/message')

var user = require('./routes/user')
var api = require('./routes/api')
var config = require('./utils/config')

var port = process.env.PORT || 3000
mongoose.Promise = require('bluebird')
// Setup Mongoose connection with mongoDB
mongoose.connect(config.mdb)
const db = mongoose.connection
db.on('error', () => console.log('Failed to connect to Database.'))
	.once('open', () => console.log('Connected to Database.'))
// Using bluebird Promise removes depricated warning

// Middlewares
app.use(passport.initialize())

// Require passport
require('./utils/passport')(passport)

app.get('/', (req, res) => {
	res.send('This is entry point')
})

app.use('/user', user)
app.use('/api', api)

/*
 *
 * Socket ...
*/
server.listen(port)

console.log(`Listening to ${port}`)

const notifier = require('mail-notifier')


function emailListener() {
	io.on('connection', (socket) => {
		socket.on('login', (data) => {
			const imap = {
				user: data.user,
				password: data.pass,
				host: "imap.gmail.com",
				port: 993, 
				tls: true,
				tlsOptions: { rejectUnauthorized: false }
			}
			const n = notifier(imap)
			n.on('end', () => n.start())
				.on('mail', mail => {
					var mail = mail.from[0].address
					console.log(mail)
					socket.emit('newemail', { hello: mail })
				}).start()
					
			})
		})
}


function emailListener2(userId) {
	User.findOne({
		_id: userId
	}, function(err, user) {
		const imap = {
			user: user.email,
			password: user.password,
			host: "imap.gmail.com",
			port: 993, 
			tls: true,
			tlsOptions: { rejectUnauthorized: false }
		}
		io.on('connection', (socket) => {
		const n = notifier(imap)
		n.on('end', () => n.start())
			.on('mail', mail => {
			var mail = mail.from[0].address
			console.log(mail)
			socket.emit('newemail', { new: mail })
			}).start()
			
		})
	})
}

function broadlinkMessage(userId) {
	User.findOne({
		_id: userId
	}, (err, user) => {
		const imap = {
			user: user.email,
			password: user.password,
			host: "imap.gmail.com",
			port: 993, 
			tls: true,
			tlsOptions: { rejectUnauthorized: false }
		}
		console.log(user)
		const n = notifier(imap)
		n.on('end', () => n.start())
			.on('mail', mail => {
				var mail = mail.from[0].address
				var newData = {
					uid: userId,
					newMail: true,
					mail: mail
				}
				Message.findOneAndUpdate({ uid: userId }, { $set: newData }, (err, data) => {
					if (err) console.log({ success: false, message: err })
					if (!data) {
						var newMessage = new Message(newData)
						newMessage.save((err1, data) => {
							if (err) console.log({ success: false, message: err1 })
							console.log({ success: true, message: data, status: 'new' })
						})
					} else {
						Message.findOne({ uid: userId }, (err2, updatedData) => {
							if (err) console.log({ success: false, message: err2 })
							console.log({ success: true, message: updatedData, status: 'updated' })
						})
					}
				})
			}).start()

	})
}

emailListener2('5990f4b39d27b6234e8cfe05')

emailListener()

broadlinkMessage('5990f4b39d27b6234e8cfe05')