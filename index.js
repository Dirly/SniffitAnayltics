var webSocketServer = require('ws').Server,

wss = new WebSocketServer ({port: 3001, path: '/path'});
wss.on('listening', function() {
    console.info('ws server is listening');
});