var express = require('express')
var bodyParser = require('body-parser')
var helmet = require('helmet')
var Imap = require('imap'),
		inspect = require('util').inspect
var mongoose = require('mongoose')
var passport = require('passport')
var Promise = require('bluebird')
var app = express()

var server = require('http').Server(app)

var io = require('socket.io')(server)

var User = require('./models/user')
var Message = require('./models/message')
var Inbox = require('./models/inbox')
var Email = require('./models/email')

var user = require('./routes/user')
var email = require('./routes/email')
var inbox = require('./routes/inbox')

var config = require('./utils/config')

var port = process.env.PORT || 3000

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 }))
app.use(helmet())

mongoose.Promise = Promise
// Setup Mongoose connection with mongoDB
mongoose.connect(config.mdb)
const db = mongoose.connection
db.on('error', () => console.log('Failed to connect to Database.'))
	.once('open', () => {
		console.log('Connected to Database.')
		emailListener()
	})
// Using bluebird Promise removes depricated warning

// Middlewares
app.use(passport.initialize())

// Require passport
require('./utils/passport')(passport)

app.get('/', (req, res) => {
	res.send('This is entry point')
})

app.use('/api', user)
app.use('/api', email)
app.use('/api', inbox)

server.listen(port, () => {
	console.log(`Listening to ${port}`)
})

const notifier = require('mail-notifier')

function emailListener() {
	io.on('connection', (socket) => {
		// on disconnected
		io.on('disconnect', (reason) => {
			console.log('we lost a client.', reason)
			var i = clients.indexOf(socket);
			clients.splice(i, 1)
		})

		// on we have active clients
		io.clients((error, clients) => {
			if (error) console.log('Error due to clients.', error)
			console.log('*****************************************************************')
			console.log('New Client: ' + socket.id)
			console.log('Total Clients: ', clients)
			console.log('*****************************************************************')

			User.findOne({}, 'email password', function(err, data) {
				if(!!data) {
					const imap = {
						user: data.email,
						password: data.password,
						host: "imap.gmail.com",
						port: 993, 
						tls: true,
						tlsOptions: { rejectUnauthorized: false }
					}
					const n = notifier(imap)
					n.on('end', () => n.start())
						.on('mail', mail => {
							Email.find({}, 'email', (err, data) => {
								!!data && !err && data.map(async (d) => {
									if(d.email === mail.from[0].address) {
										console.log('Email received from ' + mail.from[0].address)
										const newInbox = Inbox({
											from: mail.headers.from,
											date: mail.date,
											subject: mail.headers.subject,
											body: mail.html,
										})
										await newInbox.save()
										const inboxData = {
											from: mail.headers.from,
											subject: mail.headers.subject,
											date: mail.date,
											body: mail.html,
										}
										if(clients.length > 0) {
											console.log('xxx')
											clients.map((c) => io.to(c).emit('newemail', { mail: inboxData }))
										}
									}
								})
							})
						}).start()	
					
					}
				})
			})
		})
}