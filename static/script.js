//const socket = io('http://3.15.38.202:3000') // amazon instance
const socket = io('http://172.30.5.220:3000') // local
const messageForm = document.getElementById('send-container')
const messageContainer = document.getElementById('message-container')
const messageInput = document.getElementById('message-input')
const onlineUsers = document.getElementById('online-users-container')


//const name = prompt("What is your name?") // user connects and prompts for name
const name = "Victor"
appendMessage("You joined!") // tells you you joined chat room
socket.emit('new-user', name) // sends a new-user event


socket.on('chat-message', data => {
  appendMessage(data)
})


// these are kind of like action listeners, with 'user-connected' being
// an event that the server has to listen to
socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnect', message => {
  appendMessage(message)
})

socket.on('update-online-users', users => {
  setOnlineUsers(users)
})


//socket.on('on-disconnect')

// the button inside of message form acts as the listener
messageForm.addEventListener('submit', e => {
  e.preventDefault() // prevents page from refreshing
  const message = messageInput.value // get value from message input
  const data = `${name}: ${message}`
  socket.emit('send-chat-message', data) // use the socket from script.js to send a message event
  messageInput.value = '' //reset message input
  appendMessage(`You: ${message}`)
})



function appendMessage(message) {
  const messageDiv = document.createElement('div')
  messageDiv.innerText = message
  messageContainer.append(messageDiv)
}


function setOnlineUsers(users) {
  onlineUsers.innerHtml = ""
  var info = ""
  for (var user in users) {
    info += `$Online: ${users[user]}\n`
  }
  info += "Dummytext\n"
  onlineUsers.innerHtml = info

}
