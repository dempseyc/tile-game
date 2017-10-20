$(function() {

  let $body = $('body');
  let $uiTargets = $('#ui-targets');
  let $dataDisplay = $('#data-display');

  let sharedData = "";

  let gameData = {};

  let target = $('<form>message:<br><input type="text" name="message"><input type="submit" value="Submit"></form>');


// code fires the shared data update on submit
  target.submit(function( event ) {
    event.preventDefault();
    sharedData = target.find('input[name="message"]').val();
    updateData(sharedData);
  });


  $body.add(target);  // is this line really needed jquery thing?
  $uiTargets.append(target);

  var socket = io();
  // console.log(socket);

  let myClientIndex;

  // the socket.on() functions are receiving calls from the server
  socket.on('connection', function (clientIndex) {
    myClientIndex = clientIndex;
    console.log('you are connected, client ',clientIndex);
  });

  socket.on('new data', function (data) {
    $dataDisplay.html(data);
  });

  socket.on('get game data', function (data) {
    // here is where we set the game state and render the display in a way
    let gameData = data;
    console.log(gameData);
  });


  socket.on('disconnect', function () {
    // socket.emit is calling functions on the server from the client side
    socket.emit('disconnect');
  });

  // updateData is called when a client interacts with the UI target
  // data is shared with all clients through the server
  function updateData (data) {
    socket.emit('client action', data);
  }

});
