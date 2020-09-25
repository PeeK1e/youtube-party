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
		console.log("joinRoom called");
		room = data[0];
		nickname = data[1];
		socket.leave(room);
		socket.join(room);
		console.log("joined Room: " + room);
		console.log("nickname: " + nickname);
	});
	
	socket.on('playVideo', (data) => {
		watch2.to(room).emit('playVideo', data);
		queueList.splice(data["1"], 1);
		printList();
	});
	
	socket.on('addToQueue', (data) => {
		socket.to(room).emit('addToQueue', data);
		if(data != null)
			queueList.push(data);
		printList();
	});
	
	socket.on('removeFromQueue', (data) => {
		socket.to(room).emit('removeFromQueue', data);
		queueList.splice(data, 1);
		printList();
	});
	
	socket.on('play', (data) => {
		socket.to(room).emit('play', data);
		printList();
    });
    
    socket.on('stop', (data) => {
		socket.to(room).emit('stop', data);
		printList();
    });
    
    socket.on('next', (data) => {
		socket.to(room).emit('next', data);
		queueList.shift();
		printList();
    });
    
    socket.on('goToTime', (data) =>{
		socket.to(room).emit('goToTime', data);
		printList();
    });
    
    socket.on('sync', (data) => {
    	console.log(data);
        if(data == "0"){
        	var lgt = io.nsps['/'].adapter.rooms[room].length;
        	console.log("client number: " + lgt);
        	if(lgt > 1){
        		socket.to(room).emit('sync', 0);
        	}else{
        		console.log("self req.");
        		socket.to(room).emit('syncAnswer', [data["0"], data["1"], [] = queueList] );
        	}
        }else{
        	socket.to(room).emit('syncAnswer', [data["0"], data["1"], [] = queueList] );
        }
        printList();
     });
    
    socket.on('getList', (data) => {
    	queueList = data;
    	printList();
    });
    
    function printList(){
    	console.log(queueList);
    }
});

