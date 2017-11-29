// server.js

const ws = require('ws');
const express = require('express');
// const SocketServer = require('ws').Server;
const PORT = 3001;
const uuidv1 = require('uuid/v1');

const server = express()
    .use(express.static('public'))
    .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${PORT}`));

// Create the WebSockets server
const chat = new ws.Server({ server });

// Array for tracking client.
const clients = [];

// Counter for tracking active connections.
let totalClients = 0;

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the socket parameter in the callback.
chat.on('connection', (socket) => {
    clients.push(socket);
    console.log('Client connected');
    totalClients += 1;

    socket.on('message', function incoming(message) {
        let messageObj = JSON.parse(message);
        console.log('User: ' + messageObj.username + ' said: ' + messageObj.content);

        let broadcastMsg = {
            id: uuidv1(),
            username: messageObj.username,
            content: messageObj.content
        }

        clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(broadcastMsg));
            }
        });
        
    });

    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    socket.on('close', () => {
        console.log('Client disconnected');
        totalClients -= 1;
    });
});