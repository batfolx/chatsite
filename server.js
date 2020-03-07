const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');

var conn = mysql.createConnection({
  host: 'localhost',
  user: '',
  password: "",
  database: ''
});

const users = {};



app.use("/static", express.static('./static/'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', socket => {
    socket.on('new-user', name => {
        /* when user connects we send them the chat history */
        conn.query('SELECT * FROM messages', (err, rows) => {
            socket.emit('show-chat-history', rows);
        });


        /* we associate a name to the socket */
        users[socket.id] = name;

        /* tell everyone that some connected */
        socket.broadcast.emit('user-connected', name);

        /* broadcast to everyone  */
        io.emit('update-online-users', users);

    });


    /* send-chat-message is name of event, as defined in script.js */
    socket.on('send-chat-message', data => {

        /* broadcast.emit sends everyone the message, except for the person that sent message */
        socket.broadcast.emit('chat-message', data);
        console.log(data);
        const data_ = data['data'];
        const message = data['message'];
        const timestamp = data['timestamp'];
        const name = users[socket.id];

        /* gather information from the data sent back from client to insert into database  */
        const sql = `INSERT INTO messages (message, name, time_stamp, data) VALUES ('${message}', '${name}', '${timestamp}', '${data_}')`;
        conn.query(sql, (err, result) => { if (err) console.log(err); })
    });


    /* handles the name change of a person */
    socket.on('name-change', data => {
        let prevName = data['before'];
        let currName = data['after'];
        users[socket.id] = currName;

        let message = `${prevName} has changed their name to ${currName}!`;
        io.emit('chat-message', message);
        io.emit('update-online-users', users)

    });


    socket.on('disconnect', () => {
        if (users[socket.id] === typeof undefined) return;
        socket.broadcast.emit('user-disconnect', `${users[socket.id]} has disconnected`);
        updateDisconnect(conn, users[socket.id]);
        delete users[socket.id];
        socket.broadcast.emit('update-online-users', users);
    })
});


function updateDisconnect(connection, name) {
    const message = `${name} has disconnected`;
    const data = message;
    const timestamp = getTime();
    const sql = `INSERT INTO messages (message, name, time_stamp, data) VALUES ('${message}', '${name}', '${timestamp}', '${data}')`;
    connection.query(sql, (err, result) => {});
}


function getTime() {
    var d = new Date();
    var datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
        d.getHours() + ":" + d.getMinutes();
    return datestring;
}


http.listen(3000, function () {
    console.log('listening on *:3000');
});
