var express = require('express'),
     morgan = require('morgan'),
       swig = require('swig'),
     routes = require('./routes/'),
        app = express(),
   socketio = require('socket.io'),
       port = 3000,
       	 pg = require('pg'),
  conString = 'postgres://localhost:5432/twitterdb',
  	 client = new pg.Client(conString),
       server;      

//integrate view engine, swig
app.engine('html', swig.renderFile);    //how to render html templates
app.set('view engine', 'html');         //what file extension do our templates have?
app.set('views', __dirname + '/views'); //where to find views
swig.setDefaults({ cache: false });

//upon server request log the method, route, status code, etc
app.use(morgan('tiny'));

server = app.listen(port, function(){
  console.log("Listening on port "+ port);
});

//connect to postgres
client.connect();



var io = socketio.listen(server);
app.use('/', routes(io, client));