// YOUR CODE HERE:
$(document).ready(function () {
  var msgObj = {};
  var myName = window.location.search.substring(10);
  var myRoom = "4chan";
  var lastMessageTime = (new Date(0)).toJSON();
  var rooms = {};
  var friends = {};
  var banned = {};
  var serverURL = 'http://127.0.0.1';
  var serverPORT = ':3000';

  var postMSG = function (message) {
    $.ajax({
      url: serverURL + serverPORT,
      type: "POST",
      data: JSON.stringify(message),
      // contentType: 'application/json',
      success: function (data) {
        console.log("message SENT!", data);
      },
      error: function (data) {
        console.log("message not sent!", data);
      }
    });
  };

  var removeLastMessage = function () {
    $('div.messages').children().last().remove();
  };

  var formatMessages = function(results){
    for(var i = results.length-1; i >= 0; i--) {
      var $paragraph = $('<p></p>');
      var text = results[i].text;
      var $username = $('<span></span>').text(results[i].username).addClass(results[i].username);

      if (friends[results[i].username] === true) {
        $username.addClass('friend');
        $paragraph.addClass('friend');
      }
      var createdAt = results[i].createdAt;
      var messageContent =  ": " + text + "  " + createdAt;

      $('div.messages').prepend($paragraph.text(messageContent).prepend($username));

      if ($('div.messages').children().length >= 25) {
        removeLastMessage();
      }
    }
    lastMessageTime = results[0].createdAt;
  };

  var getMessages = function(){
    $.ajax({
      url: serverURL + serverPORT,
      type: 'GET',
      // data: 'aGet',
      data: {
        order: JSON.stringify('-createdAt')
        // where: JSON.stringify({
        //   roomname: myRoom
      //     createdAt: { $gt: {"__type": "Date", iso: lastMessageTime}}
        // })
      },
      success: function (data) {
        data = JSON.parse(data);
        if(data.results.length > 0){
          formatMessages(data["results"]);
        }
      },
      error: function (data) {
        console.log('not retrieved');
      }
    });
  };

  // get active rooms
  var getActiveRooms = function () {
    $.ajax({
      url: serverURL + serverPORT,
      type: 'GET',
      data: {
        order: '-createdAt',
        limit: 500,
        where: JSON.stringify({
          createdAt: { $gt: {"__type": "Date", iso: lastMessageTime}}
        })
      },
      success: function (data) {
        if(data.results.length > 0){
          roomFormat(data.results);
        }
      },
      error: function (data) {
        console.log('active rooms not retrieved');
      }
    });
  };

  var roomFormat = function (results) {
    for (var i = 0; i < results.length; i++) {
      if(rooms[results[i].roomname] === undefined){
        rooms[results[i].roomname] = false;   // default false, meaning not yet appended
      }
    }
    for (var roomname in rooms) {
      // added if clause so that only rooms that have not been added will be appended
      if (!rooms[roomname]) {
        // changed to div (from span) so that rooms appear on side (because too many rooms on top)
        // added class 'roomname' to each room div
        $('<div></div>').addClass('roomname').text(roomname).appendTo($('div.activeRooms'));
        rooms[roomname] = true;
      }
    }
  };

  var goToRoom = function () {
    $("h2.room").text(myRoom);
    $("div.messages").children().remove();
    lastMessageTime = (new Date(0)).toJSON();
    getMessages();
  };

  // changing rooms by clicking on room names
  $('.activeRooms').on('click', '.roomname',function (e) {
    myRoom = $(this).text();
    console.log("room: " + $(this).text());
    goToRoom();
  });

  // sending messages
  $('button.send').on('click', function (e) {
    var text = $('.draft').val();
    msgObj.text = text;
    msgObj.username = myName;
    msgObj.roomname = myRoom;

    postMSG(msgObj);
    $('.draft').val("");
  });

  // retrieving username from input box
  $('.username').on("keyup", function(){
      myName = $(this).val() || window.location.search.substring(10);
  });

  // retrieving chatroom name
  $('.changeRoom').on("click", function (e) {
    myRoom = $('.chatroom').val() || "4chan";
    goToRoom();
  });

  // friending 
  $('div.messages').on('click', 'span', function (e) {
    var name = $(this).text();
    friends[name] = true;
    $('.' + name).addClass('friend').parent().addClass('friend');
  });

 // getActiveRooms();
  getMessages();

 setInterval(function () {
   getMessages();
   // getActiveRooms();
 }, 3000);

});
