var express = require('express')
var Imap = require('imap'),
    inspect = require('util').inspect

var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

var port = process.env.PORT || 3000

app.get('/', (req, res) => {
	res.send('This is entry point')
})

app.post('/login', (req, res) => {
  const email = req.query.email
  const pass = req.query.pass
  emailListener(email, pass)
  res.send({ success: true })

})


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


function emailListener2() {
  io.on('connection', (socket) => {
    const imap = {
      user: 'madhavpoudel16@gmail.com',
      password: 'th3rang3@#$MP',
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
        socket.emit('newemail', { new: mail })
      }).start()
        
    })
}


emailListener2()