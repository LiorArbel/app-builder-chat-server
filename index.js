var WebSocketServer = require('websocket').server;
var http = require('http');
var _ = require('lodash');
const logger = require('./logger');

let channels = new Map();

function getOrCreateChannel(id){
    let channel;
    if(!channels.has(id)){
        channel = new Set();
        channels.set(id, channel);
    } else {
        channel = channels.get(id);
    }
    return channel;
}

var server = http.createServer(function (request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});
server.listen(process.env.PORT || 1337, function () {
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

const messageTypes = {TEXT: 'TEXT', SYSTEM: 'SYSTEM', REGISTER: 'REGISTER', CONNECTION_SUCCESS: 'CONNECTION_SUCCESS'};

// WebSocket server
wsServer.on('request', function (request, httpReq) {
    var connection = request.accept(null, request.origin);
    logger.log('new connection');

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function (message) {
        logger.log('message: ', message);
        let parsedMessage;
        try{
            parsedMessage = JSON.parse(message.utf8Data);
        } catch (e) {
            logger.error('unparsable message: ', message);
        }
        if (parsedMessage) {
            parsedMessage.time = new Date();
            if(parsedMessage.type === messageTypes.TEXT){
                const channel = getOrCreateChannel(parsedMessage.channelId);
                channel.forEach(conn => {
                    conn.send(JSON.stringify(parsedMessage));
                })
            }
            if(parsedMessage.type === messageTypes.REGISTER){
                const channel = getOrCreateChannel(parsedMessage.channelId);
                channel.add(connection);
                connection.send(JSON.stringify({type: messageTypes.CONNECTION_SUCCESS}));
            }
        }
    });

    connection.on('close', function (connection) {
        let counter = 0;
        channels.forEach(channel => {
            if(channel.has(connection)){
                channel.delete(connection);
                counter++;
            }
        });
        logger.log(`Disconnection. Deleted from ${counter} channels`);
    });
});

logger.log('listening...');