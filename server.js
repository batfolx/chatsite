var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const users = {}


app.use("/static", express.static('./static/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/static/index.html');
});



io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
    io.emit('update-online-users', users) // broadcast to everyone
    console.log(`New user connected`)
    console.log(users)
    })



  socket.on('send-chat-message', message => { // send-chat-message is name of event, as defined in script.js
    socket.broadcast.emit('chat-message', message) // broadcast.emit sends everyone the message, except for the person that sent message
  })



  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnect', `${users[socket.id]} has disconnected`)
    delete users[socket.id]
    socket.broadcast.emit('update-online-users', users)
    console.log("User disconnected")
  })
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});
