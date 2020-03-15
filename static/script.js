//const socket = io('http://3.15.38.202:3000') // amazon instance
const socket = io('http://localhost:3000'); // local
const messageForm = document.getElementById('send-container');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const onlineUsers = document.getElementById('online-users-container');
const changeNameForm = document.getElementById('change-name-container');
const allContainer = document.getElementById('container');
let name;
let typing;
let timeOut = undefined;

/* Sets up a new user */
setup();

/* Sets the event listeners for a button click */
setEventListeners();


/* Handles the chat history for the website */
socket.on('show-chat-history', chatHistory => {
    handleShowChatHistory(chatHistory);
});

/* Updates the current online users */
socket.on('update-online-users', users => {
    handleSetOnlineUsers(users);
});

/* Sends a chat message to everybody */
socket.on('chat-message', data => {
    handleChatMessage(data);
});

/* handles a user connection */
socket.on('user-connected', data => {
    appendMessage(data, false);
});

/* handles a user disconnect */
socket.on('user-disconnect', data => {
    appendMessage(data, false);
});


/**
 * Initial setup of connection
 */
function setup() {
    name = prompt("What is your name?"); // user connects and prompts for name
    const timestamp = getTime();
    const data = {
        'name': name,
        'timestamp':timestamp,
        'data': 'You joined!',
        'message': 'You joined!'
    };
    appendMessage(data, true) ;// tells you you joined chat room
    socket.emit('new-user', data); // sends a new-user event
}


/**
 * Sets the event listeners of the forms in the html
 */
function setEventListeners() {
    /* the button inside of message form acts as the listener */
    messageForm.addEventListener('submit', e => {
        e.preventDefault(); // prevents page from refreshing
        const message = messageInput.value; // get value from message input
        const data = {'data': `${name}: ${message}`,
            'timestamp': `${getTime()}`,
            'message': message,
            'name': name};
        socket.emit('send-chat-message', data) ;// use the socket from script.js to send a message event
        messageInput.value = '' ;//reset message input
        appendMessage(data, true);
    });

    changeNameForm.addEventListener('submit', e => {
        let data = {};
        e.preventDefault();
        data['before'] = name;
        const input = document.getElementById('name-input');
        if (input.value !== '') {name = input.value;}
        else {return;}
        data['after'] = input.value;
        input.value = "";
        socket.emit('name-change', data);
    });
}


/**
 * Sets the online users in a div
 * @param users the online users from the server
 */
function handleSetOnlineUsers(users) {
    setOnlineUsers(users);
    console.log("Updated users!")
}

/**
 * writes a chat message to the screen
 * @param data the data that contains the message and timestamp of the message
 */
function handleChatMessage(data) {
    appendMessage(data, false);
}


/**
 * Shows the chat history of the website
 * @param chatHistory the chathistory from the database
 */
function handleShowChatHistory(chatHistory) {
    console.log(chatHistory);
    for (let chat in chatHistory) {
        const timestamp = chatHistory[chat]['time_stamp'];
        chatHistory[chat]['timestamp'] = timestamp;
        console.log(chatHistory[chat]);
        appendMessage(chatHistory[chat], false);
    }

}

/**
 * Appends a message to the div
 * @param data the message
 * @param self if the person who sent the message is you or another user
 */
function appendMessage(data, self) {
    const messageDiv = document.createElement('div');
    messageDiv.innerText = data['timestamp'] + "@ " + data['name'] + ": " +  data['message'] + "\n";
    if (self) {
        messageDiv.style.backgroundColor = "white";
        messageDiv.style.textAlign = "right";
    } else {
        messageDiv.style.backgroundColor = "lightgray";
        messageDiv.style.textAlign = "left";
    }
    messageDiv.style.borderStyle= 'ridge';
    messageDiv.style.fontSize = '22px';

    messageContainer.append(messageDiv);
    document.body.scrollTop = document.body.scrollHeight

}


/**
 * Sets the online users in a div element
 * @param users the online users
 */
function setOnlineUsers(users) {
    onlineUsers.innerHtml = "";
    onlineUsers.innerText = "";
  let info = "";
  for (const user in users) {
        let n = users[user];
        if (name === n) {
            info += `Online: (You)${n}\n`
        } else {
            info += `Online: ${n}\n`
        }
    }
    onlineUsers.innerText = info
}


function timeout() {
    typing = false;
    socket.emit('user-typing', name);
}



function onKeyDownNotEnter() {
    if (!typing) {
        typing = true;
        timeOut = setTimeout(timeout, 5000);
    } else {
        clearTimeout(timeOut);

    }



}
/**
 * Gets the time in a neatly formatted string
 * @returns {string} the time in a string
 */
function getTime() {
    const d = new Date();
    return d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
        d.getHours() + ":" + d.getMinutes();
}
