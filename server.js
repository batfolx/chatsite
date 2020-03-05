var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const users = {}

app.use("/static", express.static('./static/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
  //res.send('<h1>Hello world</h1>');
});



io.on('connection', socket => {
  console.log("New user!")
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })

  socket.on('send-chat-message', message => { // send-chat-message is name of event, as defined in script.js
    socket.broadcast.emit('chat-message', message) // broadcast.emit sends everyone the message, except for the person that sent message
  })



  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnect', `${users[socket.id]} has disconnected`)
    delete users[socket.id]
  })
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
