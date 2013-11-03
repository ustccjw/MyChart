var socket = io.connect(location.host, 
             {'reconnect': false, 'connect timeout': 120000}) ;

$(function(){
    var chatApp = new Chat(socket) ;

    socket.on('users', function(result){
        var type = result.type ;
        if(type === 'insert'){
            var users = result.users ;
            var room = result.room ;
            insertUsers(users, result.room) ;
        } else if(type === 'update'){
            var oldName = result.oldName ;
            var newName = result.newName ;
            updateUsers(oldName, newName) ;
        } else if(type === 'delete'){
            var name = result.name ;
            deleteUsers(name) ;
        }
    }) ;

    socket.on('message', function(message){
        insertMessage(message) ;
    }) ;

    $('#send-message button').on('click', function(){
        var text = $('#send-message input').val() ;
        if($.trim(text) === ''){
            return true ;
        }
        processUserInput(chatApp, socket, text) ;
        $('#send-message input').val('') ;
        $('#send-message input').focus() ;
    }) ;

    $(document).on('keyup', function(event){
        if(event.which === 13){
            if(document.activeElement === $('#send-message input').get(0)){
                $('#send-message button').click() ;
            }
        }
    }) ;

    $('#send-message input').focus() ;
}) ;

function processUserInput(chatApp, socket, text){
    if(text[0] === '/'){
        var text = chatApp.processCommand(text) ;
    } else{
        var room = $('#chat-room').text() ;
        chatApp.sendMessage(room, text) ;
        insertMessage({name: 'ME', text: text}) ;
    }
}

function insertMessage(message){
    var name = message.name ;
    var text = message.text ;
    var html = '' ;

    if(name === 'system'){
        html = '<li>' + text +'</li>' ;
        $('#sys-message ul').append(html).
                scrollTop($('#sys-message ul').prop('scrollHeight')) ;
    } else{
        html = '<li><div class="nick-name"> ' + name + ': </div>' +
               '<div class="message">' + text + '</div></li>' ;
        $('#chat-list ul').append(html).
                scrollTop($('#chat-list ul').prop('scrollHeight')) ;

    }
}

function insertUsers(users, room){
    var html = '' ;
    if(room !== undefined){
        $('#chat-info ul').html('') ;
        $('#chat-list ul').html('') ;
        $('#chat-room').text(room) ;
        users.forEach(function(name, index){
            html += '<li> ' + name + ' </li>' ;
        }) ;
    } else{
        html = '<li> ' + users + ' </li>' ;
    }
    $('#chat-info ul').append(html).
            scrollTop($('#chat-info ul').prop('scrollHeight')) ;
}

function updateUsers(oldName, newName){
    $('#chat-info ul li:contains(' + oldName + ')').text(newName) ;
}

function deleteUsers(name){
    $('#chat-info ul li:contains(' + name + ')').remove() ;
}
