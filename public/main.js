$(function() {

  let $body = $('body');
  let $uiTargets = $('#ui-targets');
  let $dataDisplay = $('#data-display');

  let newGameData = "";

  let gameData = {};

  let target = $('<form>message:<br><input type="text" name="message"><input type="submit" value="Submit"></form>');


// code fires the shared data update on submit
  target.submit(function( event ) {
    event.preventDefault();
    newGameData = target.find('input[name="message"]').val();
    updateData(newGameData);
  });

////////////////////////////////where to put this...

  $body.add(target);  // is this line really needed jquery thing?
  $uiTargets.append(target);

  var socket = io.connect();
  // console.log(socket);

  let myClientID;
  let myRoom = "roomOne";
  let iAmPlayer = "";
  let myGameData = {};

  // the socket.on() functions are receiving calls from the server
  // socket.emit() is calling functions on the server from the client side

  socket.on('connection', function (ID) {
    myClientID = ID;
    console.log('you are connected, client ', myClientID);
    socket.emit('subscribe', myRoom);
  });

  socket.on('get player number', function (num) {
    iAmPlayer = num;
  });

// update game data will be called by server when THIS player makes a move
  socket.on('update game data', function (data) {
    myGameData = data;
    $dataDisplay.html(data);
    socket.emit('move made', )
  });

// get game data will be called by server when both players are present
// or when the OTHER player makes a move
  socket.on('get game data', function (data) {
    myGameData = data;
    console.log(myGameData, "player", iAmPlayer);
  });


  socket.on('disconnect', function (myClientID) {
    socket.emit('unsubscribe', myRoom)
    socket.emit('disconnect', myClientID);
  });


  // data in this function should be all game data
  function updateData (data) {
    socket.emit('update game data', function (data) {
    })
  }

});
