var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = process.env.PORT || 8888;

users = [];
connections = [];

server.listen(port);
console.log('Server UP & RUNNING on : '+port);

app.get('/',function(req,res){
    res.sendFile(__dirname+'/public/index.html');
});

io.on('connection',function(socket){
    connections.push(socket);
    console.log('Connected : ',connections.length);

    //disconnect
    socket.on('disconnect',function(data){
        users.splice(users.indexOf(socket.username),1);
        updateUsernames();
        connections.splice(users.indexOf(socket),1);
        console.log('Disconnected...');
        console.log('Total Users active : '+connections.length);
        io.sockets.emit('disconnectedUser',{userNm:socket.username});
    });

    //send message
    socket.on('send message',function(data){
        var time = displayCurrentTime();
        io.sockets.emit('new message', {msg:data, user: socket.username,sentBytime: time});
    });

    //New User
    socket.on('new user',function(data, callback){
        if(users.indexOf(data) != -1){
            callback({isValid: false});
        }
        else{
            callback({isValid: true});
            socket.username = data;
            users.push(socket.username);
            updateUsernames();
            myUsers();
        }
    });

    socket.on('typing', function(data) {
    	io.sockets.emit("isTyping", {isTyping: data, person: socket.username});
    });


    function updateUsernames(){
        io.sockets.emit('get users', users);
    }

    function myUsers(){
        io.sockets.emit('my users', {userNew:socket.username});
    }

    function displayCurrentTime() {
        var date = new Date();
        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        time = hours + ":" + minutes + " " + am_pm;
        return time;
    };
});