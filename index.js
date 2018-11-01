var WebSocketServer = require('websocket').server;
var http = require('http');

let connections = new Set();
var server = http.createServer(function (request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});
server.listen(1337, function () {
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function (request) {
    var connection = request.accept(null, request.origin);
    log('new connection');
    connections.add(connection);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function (message) {
        log('message: ', message);
        if (message.type === 'utf8') {
            connections.forEach(conn => {
                conn.send(message.utf8Data);
            })
        }
    });

    connection.on('close', function (connection) {
        log('disconnection');
        connections.delete(connection);
    });
});

log('listening...');

function log(...args) {
    console.log((new Date()).toLocaleString(), ...args);
}