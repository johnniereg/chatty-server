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
let totalClients = {
    type: 'clients',
    count: 0
};

// Function to broadcast messages to all active clients.
chat.broadcast = function broadcast(data) {
    chat.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Function to generate random colour hex.
function getRandomHex() {
    const chars = '0123456789ABCDEF';
    let hex = '#';
    for (var i = 0; i < 6; i++) {
        hex += chars[Math.floor(Math.random() * 16)];
    }
    return hex;
}

// Function to build hex assignment message.
function assignHex() {
    const hexMsg = {
        type: 'hex-assign',
        hex: getRandomHex()
    }
    return hexMsg;
}


chat.on('connection', (socket) => {

    socket.send(JSON.stringify(assignHex()));

    console.log('Client connected');
    totalClients.count += 1;
    chat.broadcast(totalClients);

    socket.on('message', function incoming(message) {
        let messageObj = JSON.parse(message);

        let broadcastMsg = {
            id: uuidv1(),
            type: messageObj.type
        };

        if (messageObj.type === 'chatMsg') {
            broadcastMsg['username'] = messageObj.username;
            broadcastMsg['content'] = messageObj.content;
            broadcastMsg['userhex'] = messageObj.hex;
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
        totalClients.count -= 1;
        chat.broadcast(totalClients);
        
        
    });
});