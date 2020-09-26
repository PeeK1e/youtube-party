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

    //changes the values for room and name (names are not implemented yet)
    socket.on('joinRoom', (data) => {
        room = data[0];
        nickname = data[1];
        console.log("joining room: " + room + " as " + nickname);
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

    //is called when a client connects new to an existing room
    //it checks if the client is alone in the room or if he can ask one of the other clients for an queue list
    socket.on('sync', (data) => {
        if (data == "0") {
            console.log("getting number of clients for room" + room);
            var lgt = io.nsps['/'].adapter.rooms[room];
            console.log(lgt.length);
            if (lgt.length > 1) {
                socket.to(room).emit('sync', 0);
            } else {
                console.log("self req.");
                socket.to(room).emit('syncAnswer', [data["0"], data["1"], [] = q                                                                                                                                                             ueueList]);
            }
        } else {
            console.log("sending list: " + queueList);
            socket.to(room).emit('syncAnswer', [data["0"], data["1"], [] = queue                                                                                                                                                             List]);
        }
    });

    socket.on('getList', (data) => {
        queueList = data;
    });


});
