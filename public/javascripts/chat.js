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

Chat.prototype.processCommand = function(words){
    var index = words.indexOf(' ') ;
    var command = words.slice(1, index) ;
    var message = '' ;

    switch(command){
        case 'join':
            var room = words.slice(index + 1) ;
            this.changeRoom(room) ;
            break ;

        case 'nick':
            var name = words.slice(index + 1) ;
            this.socket.emit('nameAttempt', name) ;
            break;

        default:
            message = 'Unrecognized command.' ;
            break ;
    }

    return message ;
} ;


