//const socket = io('http://3.15.38.202:3000') // amazon instance
const socket = io('http://192.168.1.9:3000') // local
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const onlineUsers = document.getElementById('online-users-container')
const changeNameForm = document.getElementById('change-name-container')


let name = prompt("What is your name?"); // user connects and prompts for name
//const name = "Victor"
appendMessage("You joined!", true) ;// tells you you joined chat room
socket.emit('new-user', name); // sends a new-user event

socket.on('update-online-users', users => {
    setOnlineUsers(users);
    console.log("Updated users!")
});

socket.on('chat-message', data => {
    appendMessage(data, false);
});

// these are kind of like action listeners, with 'user-connected' being
// an event that the server has to listen to
socket.on('user-connected', name => {
    appendMessage(`${name} connected`, false);
});


socket.on('user-disconnect', message => {
    appendMessage(message, false);
});

// the button inside of message form acts as the listener
messageForm.addEventListener('submit', e => {
    e.preventDefault(); // prevents page from refreshing
    const message = messageInput.value; // get value from message input
    const data = `${name}: ${message}`;
    socket.emit('send-chat-message', data) ;// use the socket from script.js to send a message event
    messageInput.value = '' ;//reset message input
    appendMessage(`You: ${message}`, true)
});

changeNameForm.addEventListener('submit', e => {
    let data = {};

  e.preventDefault();
  data['before'] = name;
  input = document.getElementById('name-input');
  if (input.value !== '') {name = input.value}
  else {return}
  data['after'] = input.value;
  input.value = "";

  socket.emit('name-change', data);

});




function appendMessage(message, self) {
    const messageDiv = document.createElement('div');
    const timestamp = document.createElement('div');
    timestamp.value = new Date().getTime();
    messageDiv.innerText = message + "\n" + timestamp.value ;
    if (self) {
        messageDiv.style.backgroundColor = "white"
    } else {
        messageDiv.style.backgroundColor = "lightgray"
    }
    messageDiv.append(timestamp);
    messageContainer.append(messageDiv)
}


function setOnlineUsers(users) {
    onlineUsers.innerHtml = "";
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
