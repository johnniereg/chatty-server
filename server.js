// server.js

const ws = require('ws');
const express = require('express');
const PORT = 3001;
const uuidv1 = require('uuid/v1');

const server = express()
    .use(express.static('public'))
    .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${PORT}`));

// Create the WebSockets server
const chat = new ws.Server({ server });

// Counter for tracking active connections.
let totalClients = 0;

// Function to broadcast messages to all active clients.
chat.broadcast = function broadcast(data) {
    chat.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

chat.on('connection', (socket) => {

    console.log('Client connected');
    totalClients += 1;
    console.log('Client count: ', totalClients);

    socket.on('message', function incoming(message) {
        let messageObj = JSON.parse(message);
        console.log(messageObj);

        console.log('User: ' + messageObj.username + ' said: ' + messageObj.content);

        let broadcastMsg = {
            id: uuidv1(),
            type: messageObj.type
        };

        if (messageObj.type === 'chatMsg') {
            broadcastMsg['username'] = messageObj.username;
            broadcastMsg['content'] = messageObj.content;
        }

        if (messageObj.type === 'sysMsg') {
            broadcastMsg['username'] = 'jChat-Server';
            broadcastMsg['content'] = messageObj.oldName + ' changed their name to ' + messageObj.newName;
        }

        chat.broadcast(broadcastMsg);
    });

    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    socket.on('close', () => {
        console.log('Client disconnected');
        totalClients -= 1;
        console.log('Client count: ', totalClients);
        
    });
});