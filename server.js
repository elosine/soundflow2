var express = require('express');
var app = express();
var path = require('path');
var timesyncServer = require('timesync/server');
var server = require('http').createServer(app);
io = require('socket.io').listen(server);

const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

// handle timesync requests
app.use('/timesync', timesyncServer.requestHandler);

//socket.io
io.on('connection', function(socket) {
  socket.on('createEvents', function(data) {
    socket.broadcast.emit('createEventsBroadcast', {
      eventDataArr: data.eventDataArr
    });
    socket.emit('createEventsBroadcast', {
      eventDataArr: data.eventDataArr
    });
  });
  socket.on('startpiece', function(data) {
    socket.emit('startpiecebroadcast', {});
    socket.broadcast.emit('startpiecebroadcast', {});
  });
  socket.on('pause', function(data) {
    socket.emit('pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
    socket.broadcast.emit('pauseBroadcast', {
      pauseState: data.pauseState,
      pauseTime: data.pauseTime
    });
  });
  // LOAD PIECE
  socket.on('loadPiece', function(data) {
    socket.emit('loadPieceBroadcast', {
      eventsArray: data.eventsArray
    });
    socket.broadcast.emit('loadPieceBroadcast', {
      eventsArray: data.eventsArray
    });
  });
  // NEW TEMPO
  socket.on('newTempo', function(data) {
    socket.emit('newTempoBroadcast', {
      newTempo: data.newTempo
    });
    socket.broadcast.emit('newTempoBroadcast', {
      newTempo: data.newTempo
    });
  });
  // STOP
  socket.on('stop', function(data) {
    socket.emit('stopBroadcast', {});
    socket.broadcast.emit('stopBroadcast', {});
  });

});
