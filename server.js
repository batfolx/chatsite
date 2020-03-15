const app = require('express')();
const express = require('express');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');

var conn = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

const users = {};



app.use("/static", express.static('./static/'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', socket => {
    /* listens for a new user */
    socket.on('new-user', name => {
        handleNewUser(socket, name);
    });

    /* listens for the send-chat-message event*/
    socket.on('send-chat-message', data => {
        handleSendChatMessage(socket, data);
    });

    /* listens for the name-change event */
    socket.on('name-change', data => {
        handleNameChange(socket, data);
    });

    /* handles the disconnect of a user */
    socket.on('disconnect', () => {
        handleDisconnect(socket);
    })


});


/**
 * Handles the initial connection of a user
 * @param socket the socket the user is using
 * @param data the name of the user
 */
function handleNewUser(socket, data) {
    /* when user connects we send them the chat history */
    conn.query('SELECT * FROM messages', (err, rows) => {
        socket.emit('show-chat-history', rows);
    });

    /* we associate a name to the socket */
    users[socket.id] = data['name'];

    /* tell everyone that some connected */
    socket.broadcast.emit('user-connected', data);
    console.log(users);
    /* broadcast to everyone */
    io.emit('update-online-users', users);
}

/**
 * Handles sending the chat message to everybody
 * @param socket
 * @param data
 */
function handleSendChatMessage(socket, data) {
    /* broadcast.emit sends everyone the message, except for the person that sent message because */
    /* We have already accounted for their message being added in script.js */
    socket.broadcast.emit('chat-message', data);
    const data_ = data['data'];
    const message = data['message'];
    const timestamp = data['timestamp'];
    const name = data['name'];

    /* gather information from the data sent back from client to insert into database  */
    const sql = `INSERT INTO messages (message, name, time_stamp, data) VALUES ('${message}', '${name}', '${timestamp}', '${data_}')`;
    conn.query(sql, (err, result) => { if (err) console.log(err); })
}

/**
 * This function handles the users name change and broadcasts the name change to everyone
 * as well as updating the name in the online users container
 * @param socket the socket connection
 * @param data the data sent from the client containing the changed name and the previous alias/name
 */
function handleNameChange(socket, data) {
    let prevName = data['before'];
    let currName = data['after'];
    users[socket.id] = currName;
    let message = `${prevName} has changed their name to ${currName}!`;
    io.emit('chat-message', message);
    io.emit('update-online-users', users)
}



/**
 * This function handles the disconnect of a user from the site.
 * @param socket the socket connection.
 */
function handleDisconnect(socket) {
    /* check to see if the socket is null */
    if (users[socket.id] === undefined) return;
    if (users[socket.id] === null) return;
    const n = users[socket.id];
    const data = {
        'name': n,
        'message': `${n} has disconnected!`,
        'timestamp': getTime()
    };
    socket.broadcast.emit('user-disconnect', data);
    updateDisconnectInDb(conn, users[socket.id]);
    delete users[socket.id];
    socket.broadcast.emit('update-online-users', users);
}

/**
 * This
 * @param connection the MySQL database connection.
 * @param name the users name.
 */
function updateDisconnectInDb(connection, name) {
    const message = `${name} has disconnected`;
    const data = message;
    const timestamp = getTime();
    const sql = `INSERT INTO messages (message, name, time_stamp, data) VALUES ('${message}', '${name}', '${timestamp}', '${data}')`;
    connection.query(sql, (err, result) => {});
}


/**
 * Gets the time in a neatly formatted way
 * @returns {string} -> the time
 */
function getTime() {
    const d = new Date();
    return d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
        d.getHours() + ":" + d.getMinutes();
}


http.listen(3000, function () {
    console.log('listening on *:3000');
});


/*
*
* create table messages(
    -> message varchar(255),
    -> name varchar(255),
    -> time_stamp varchar(255),
    -> data varchar(255)
    -> );
 */
