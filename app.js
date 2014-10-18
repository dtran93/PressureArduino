var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();

var http = require('http');
var server = http.createServer(app);
// For Arduino Connection and Updating Data
var socketio = require('socket.io');
var SerialPort = require("serialport").SerialPort;

var socketServer;
var serialPort;
var portName = "/dev/tty.usbmodem1421"; //change this to your Arduino port
var sendData = "";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(3000);
console.log('Listening on port 3000');

serialListener();
initSocketIO(server);

function initSocketIO(httpServer) {
    socketServer = socketio.listen(httpServer);
    socketServer.on('connection', function (socket) {
        console.log("user connected");
        socket.emit('onconnection', {pollOneValue:sendData});
        socketServer.on('update', function(data) {
            socket.emit('updateData',{pollOneValue:data});
        });
    });
}

// Listen to serial port
function serialListener() {
    var receivedData = "";
    serialPort = new SerialPort(portName, {
        baudrate: 9600,
        // defaults for Arduino serial communication
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    });

    serialPort.on("open", function () {
        console.log('open serial communication');
        // Listens to incoming data
        serialPort.on('data', function(data) {
            receivedData += data.toString();
            if (receivedData .indexOf('E') >= 0 && receivedData .indexOf('B') >= 0) {
             sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
             receivedData = '';
            }
            socketServer.emit('update', sendData);
        });  
    });  
}

module.exports = app;
