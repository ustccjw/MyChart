var Chat = function(socket){
    this.socket = socket ;
}

Chat.prototype.sendMessage = function(room ,text){
    var message = {room: room, text: text} ;
    this.socket.emit('message', message) ;
} ;

Chat.prototype.changeRoom = function(room){
    this.socket.emit('join', {newRoom: room}) ;
} ;

Chat.prototype.changeName = function(name){
    this.socket.emit('nameAttempt', {newName: name}) ;
}

Chat.prototype.processCommand = function(text){
    var index = text.indexOf(' ') ;
    var command = text.slice(1, index) ;
    var message = '' ;

    switch(command){
        case 'join':
            var room = text.slice(index + 1) ;
            this.changeRoom(room) ;
            break ;

        case 'nick':
            var name = text.slice(index + 1) ;
            this.changeName(name) ;
            break;

        default:
            message = 'Unrecognized command.' ;
            break ;
    }

    return message ;
} ;


