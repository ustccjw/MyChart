var socketio = require('socket.io') ;
var io = null ;
var guestNumber = 1;
var count = 1 ;
var nickNames = {} ;
var namesUsed = [] ;
var currentRoom = {} ;

exports.listen = function(server){
    io = socketio.listen(server) ;
    io.set('log level', 1) ;

    io.sockets.on('connection', function(socket){
        assignGuestName(socket) ;
        joinRoom(socket, 'Star Sky') ;

        handleMessageBroadcasting(socket) ;
        handleNameChangeAttempts(socket) ;
        handleRoomJoining(socket) ;
        handleClientDisconnection(socket) ; 
    }) ;
} ;

function assignGuestName(socket){
    var name = 'Guest' + guestNumber ;
    nickNames[socket.id] = name ;

    var text = 'You are now known as "' + name + '".' ;
    socket.emit('message', {name: 'system', text: text}) ;
    namesUsed.push(name) ;
    guestNumber++ ;
    count++ ;
}

function joinRoom(socket, room){
    socket.join(room) ;
    currentRoom[socket.id] = room ;

    var text = '"' + nickNames[socket.id] + '" has joined "' + room + '".'; 
    socket.broadcast.to(room).emit('message', {name: 'system', text: text}) ;
    socket.broadcast.to(room).emit('users', 
            {type: 'insert', users: nickNames[socket.id]}) ;

    var users = io.sockets.clients(room) ;
    var usersName = [] ;
    users.forEach(function(socket, index){
        usersName.push(nickNames[socket.id]) ;
    }) ;
    usersName.unshift(usersName.pop()) ;
    socket.emit('users', {type: 'insert', users: usersName, room: room}) ;
    var text = 'You have joined "' + room + '".' ;   
    socket.emit('message', {name: 'system', text: text}) ;
}

function handleNameChangeAttempts(socket){
    socket.on('nameAttempt', function(name){
        var name = name.newName ;
        var text = '' ;
        if(name.indexOf('Guest') === 0 || name === 'system'){
            text = 'Names cannot begin with "Guest"' +
                       'or equal to "system".' ;
            socket.emit('message', {name: 'system', text: text}) ; 
        } else{
            if(namesUsed.indexOf(name) === -1){
                var previousName = nickNames[socket.id] ;
                var previousNameIndex = namesUsed.indexOf(previousName) ;
                namesUsed[previousNameIndex] = name ;
                nickNames[socket.id] = name ;

                text = 'You have change your name to "' + name + '".' ;
                socket.emit('message', {name: 'system', text: text}) ;
                socket.emit('users', {type: 'update', 
                        oldName: previousName, newName: name}) ;
                var room = currentRoom[socket.id] ;
                text = '"' + previousName + '" is now known as "'+ 
                       name + '".' ;
                socket.broadcast.to(room).emit('message',
                        {name: 'system', text: text}) ;
                socket.broadcast.to(room).emit('users', {type: 'update',
                        oldName: previousName, newName: name}) ;
            } else{
                text = 'That name is already in use.' ;
                socket.emit('message', {name: 'system', text: text}) ;
            }
        }
    }) ;
}

function handleMessageBroadcasting(socket){
    socket.on('message',  function(message){
        socket.broadcast.to(message.room).emit('message', 
            {name: nickNames[socket.id], text: message.text}) ;
    }) ;
}

function handleRoomJoining(socket){
    socket.on('join', function(room){
        socket.leave(currentRoom[socket.id]) ;
        leaveRoom(socket) ;
        joinRoom(socket, room.newRoom) ;
    }) ;
}

function handleClientDisconnection(socket){
    socket.on('disconnect', function(){
        leaveRoom(socket) ;
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]) ;
        delete namesUsed[nameIndex] ;
        delete nickNames[socket.id] ;
        count-- ;
        if(count === 1){
            guestNumber = 1 ;
        }
    }) ;
}

function leaveRoom(socket){
    var room = currentRoom[socket.id] ;
    var name = nickNames[socket.id] ;
    socket.broadcast.to(room).emit('users', {type: 'delete', name: name}) ;
    var text = '"' + name + '" has gone out.' ;
    socket.broadcast.to(room).emit('message', {name: 'system', text: text}) ;
}
