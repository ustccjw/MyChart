var socket = io.connect() ;

$(function(){
    var chatApp = new Chat(socket) ;

    socket.on('nameResult', function(result){
        var message = '' ;
        if(result.success){
            message = 'You are now known as ' + result.name + '.' ;
        } else{
            message = result.message ;
        }
        $('#sys-message ul').append('<li>' + message +'</li>') ;
    }) ;

    socket.on('joinResult', function(result){
        var message = 'Room has changed to ' + '"' + result.room + '".';
        $('#sys-message ul').append('<li>' + message +'</li>') ;
        $('#chat-room').text(result.room) ;
    }) ;

    socket.on('message', function(message){
        var nickName = message.nickName ;
        var text = message.text ;
        var html = '<li><div class="nick-name"> ' + nickName + ': </div>'+
                   '<div class="message">' + text + '</div></li>' ;
        $('#chat-list ul').append(html) ;
    }) ;

    socket.on('rooms', function(rooms){

    }) ;

    setInterval(function(){
        socket.emit('rooms') ;
    }, 1000) ;

    $('#send-message button').on('click', function(){
        var message = $('#send-message input').val() ;
        processUserInput(chatApp, socket, message) ;
        $('#send-message input').val('')
    }) ;
}) ;

function processUserInput(chatApp, socket, message){
    if(message[0] === '/'){
        var systemMessage = chatApp.processCommand(message) ;
        $('#sys-message ul').append('<li>' + systemMessage +'</li>') ;
    } else{
        var room = $('#chat-room').text() ;
        chatApp.sendMessage(room, message) ;

        var html = '<li><div class="nick-name"> ME: </div>'+
                    '<div class="message">' + message + '</div></li>' ;
        $('#chat-list ul').append(html) ;
    }
}
