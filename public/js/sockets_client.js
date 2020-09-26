(function () {
    //local client info
    var myRoom = "open";
    var requestedSync = false;

    //elements
    var urlbar = $('#urlBar');
    var qButton = $('#addQ');

    //gets the room id specified in URL
    window.onload = function () {
        $('#player').hide();
        var paramList = new URLSearchParams(location.search);
        myRoom = paramList.get('room');
        player.addEventListener('onReady', function () {
            syncWithRoom();
            requestedSync = true;
            //parameter 0 means "I requested the List"
            socket.emit('sync', 0);
        });
        player.addEventListener('onStateChange', playerUpdatedState);
        //calling this funtion every 1 secon to update the time on all clients
        setInterval(updateSeekTime, 1000);
        //console.log(myRoom);
    }

    //add event listeners
    qButton.on('click', function () {
        addToQueueAndEmit(getVideoIdFromUrl());
    });

    urlbar.on('keypress', function (e) {
        if (e.which == 13) {
            addToQueueAndEmit(getVideoIdFromUrl());
        }
    });

    //connects to Websocket service
    // ENTER YOUR SOCKET ULR HERE
    var socket = io('http://localhost:3000');


    //update the room information on connection to socket.io
    function syncWithRoom() {
        socket.emit('joinRoom', [myRoom, "null"]);
    }

    //add a video to the queue
    //called through websockt communication
    function addToQueue(id) {
        if (id == null) {
            return 0;
        }

        var itemList = $('#qItems')

        var qItem = $('<img class=\"qItem\"/>').text(id).on('click', function () {
            var pos = $('.qItem').index(this);
            socket.emit('playVideo', [id, pos]);
        });

        qItem.on('contextmenu', function (e) {
            e.preventDefault();
            var pos = $('.qItem').index(this);
            socket.emit('removeFromQueue', pos);
            $(this).remove();
            return false;
        });

        var imageUrl = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";

        qItem.attr('src', imageUrl);

        itemList.append(qItem);
    }

    //to prevent recursive calls only the client that wants to add
    //to the queue calls this function
    function addToQueueAndEmit(id) {
        addToQueue(id);
        socket.emit('addToQueue', id);
    }

    //get the ID from a youtube video
    function getVideoIdFromUrl() {
        var url = "?" + $('#urlBar').val().split('?')[1];
        $('#urlBar').val("");

        var l_id = new URLSearchParams(url).get('v');

        return l_id;
    }

    //start a video selected by a client
    //removes the item from the list
    function startVideoById(data) {
        $('.qItem').eq(data["1"]).remove();
        player.loadVideoById(data["0"], 0);
    }

    //removes an item from the list
    function removeFromQueue(id) {
        $('.qItem').eq(id).remove();
    }

    //this gets called by the player when the state is changed
    //updates the state for all clients in a room
    //corresponding actions are found at the bottom of this file for other clients
    function playerUpdatedState(event) {
        switch (player.getPlayerState()) {
            case 1:
                socket.emit('play', 0);
                break;
            case 2:
                socket.emit('stop', 0);
                break;
            case 0:
                socket.emit('next', 0);
                break;
            default:
                break;
        }
    }

    function updateQueueList(data) {
        if (requestedSync) {
            requestedSync = false;
            if (data[0] != null) {
                $('#player').show();
                player.loadVideoById(data[0], 0);
//              ytplayer.getDuration();
//              player.seekTo(0, true);
                player.seekTo(data[1], true);
           }
            console.log("got list: " + data[2]);
            socket.emit('getList', data[2]);
            data[2].forEach(element => {
                addToQueue(element);
            });
        }
    }


    //function because youtubes API cant hadle skips
    var oldTime = 0;
    function updateSeekTime(){
        var currTime = player.getCurrentTime();
        //console.log(oldTime + "<- old new ->" + currTime);
        if(oldTime+5 < currTime || currTime < oldTime-5){
        //      console.log("called update");
                socket.emit('goToTime', player.getCurrentTime());
        }
        oldTime=currTime
    }

    //socket listeners
    socket.on('playVideo', (data) => {
        $('#player').show();
        startVideoById(data);
        oldTime = 0;
    });

    socket.on('addToQueue', (data) => {
        addToQueue(data);
    });

    socket.on('removeFromQueue', (data) => {
        removeFromQueue(data);
    });

    socket.on('play', (data) => {
        player.playVideo();
    });

    socket.on('stop', (data) => {
        player.pauseVideo();
    });

    socket.on('next', (data) => {
        $('.qItem').eq(0).click();
    });

    socket.on('goToTime', (data) => {
        player.seekTo(data);
        oldTime=data;
    });

    socket.on('sync', (data) => {
        //on sync request tell server to send my list
        socket.emit('sync', [player.getVideoData()['video_id'], player.getCurrentTime()]);
    });

    socket.on('syncAnswer', (data) => {
        updateQueueList(data);
    });

})();
