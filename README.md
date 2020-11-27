# youtube-party

This project is basicly a watch2gether clone. It is using the socket.io websocket engine.

The necessary files for the webserver are in "/public" written in HTML and JS.
The WS-Server is written with Nodejs.

~~A Live Demo can be found at http://watch.peek1e.eu [OFFLINE]~~

~~On my Demo-Sever you also an create a own room under http://watch.peek1e.eu/r/YOUR-ROOM-NAME [OFFLINE]~~

Running the server locally you can create rooms with this URL: http://localhost/index.html?room=YOUR-ROOM-NAME

The App is not optimized for HTTPS! Its working well for http requests, a Rasperry PI 3 is apparently too slow for https requests.

The license and source code from sockets.io can be found here: https://github.com/socketio/socket.io
