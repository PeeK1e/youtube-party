const io = require('socket.io')(3000, {
    path: '/',
    serveClient: false,
    // below are engine.IO options
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

const watch2 = io.of('/');

watch2.on('connection', socket => {
    //client information is stored here
    var room;
    var nickname;
    var queueList = [];

    //called on connect or room change
    //changes the values for room and name
    socket.on('joinRoom', (data) => {
        room = data[0];
        nickname = data[1];
        socket.leave(room);
        socket.join(room);
    });

    socket.on('playVideo', (data) => {
        watch2.to(room).emit('playVideo', data);
        queueList.splice(data["1"], 1);
    });

    socket.on('addToQueue', (data) => {
        socket.to(room).emit('addToQueue', data);
        if (data != null)
            queueList.push(data);
    });

    socket.on('removeFromQueue', (data) => {
        socket.to(room).emit('removeFromQueue', data);
        queueList.splice(data, 1);
    });

    socket.on('play', (data) => {
        socket.to(room).emit('play', data);
    });

    socket.on('stop', (data) => {
        socket.to(room).emit('stop', data);
    });

    socket.on('next', (data) => {
        socket.to(room).emit('next', data);
        queueList.shift();
    });

    socket.on('goToTime', (data) => {
        socket.to(room).emit('goToTime', data);
    });

    // is called when a client connects new to the room
    //it checks if the client is alone in the room or if he can ask one of the other clients for an queue list
    socket.on('sync', (data) => {
        if (data == "0") {
            var lgt = io.nsps['/'].adapter.rooms[room].length;
            if (lgt > 1) {
                socket.to(room).emit('sync', 0);
            } else {
                console.log("self req.");
                socket.to(room).emit('syncAnswer', [data["0"], data["1"], [] = queueList]);
            }
        } else {
            socket.to(room).emit('syncAnswer', [data["0"], data["1"], [] = queueList]);
        }
    });

    socket.on('getList', (data) => {
        queueList = data;
    });


});
