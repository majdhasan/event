var app = require('../app');

const Conversation = require('../model/Conversation');


// Initilize HTTP Server for the socket io chat
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
  socket.on('add', (msg) => {
    io.emit('message', msg);
    Conversation.findById(msg.conversation, (err, conv) => {
      conv.messages.push(msg);
      conv.save((err) => {
        if (err) throw err;
      });
    });
  });

  socket.on('loadMessages', (msg) => {
    if (msg.length > 0) {
      Conversation.findById(msg, (err, conversation) => {
        if (err) throw err;
        socket.emit('initialMessages', conversation.messages);
      });
    }
  });

  socket.on('disconnect', () => {});
});

// Listen on the port
http.listen(process.env.PORT, () => {
  console.log('App started on port ' + process.env.PORT);
});
