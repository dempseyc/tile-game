$(function() {

  // let $body = $('body');
  // let $uiTargets = $('#ui-targets');
  // let $dataDisplay = $('#data-display');

  let gameData = {};

  // let target = $('<form>message:<br><input type="text" name="message"><input type="submit" value="Submit"></form>');


// code fires the shared data update on submit
  // target.submit(function( event ) {
  //   event.preventDefault();
  //   newGameData = target.find('input[name="message"]').val();
  //   updateData(newGameData);
  // });

  // $body.add(target);
  // $uiTargets.append(target);

/////////////////////////////////////////////
/////////////////////////////////////////////
//// socket stuff in client

  var socket = io.connect();
  // console.log(socket);

  let myClientID;
  let myRoom = "roomOne";
  let iAmPlayer;
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

// start game will be called by server when BOTH players are present
  socket.on('start game', function (data) {
    //startGame should do jquery stuff populating bases and hand tiles
    startGame(data);
    myGameData = data;
    // console.log("myGameData", myGameData);
    console.log("iAmPlayer", iAmPlayer);

  });

// get game data will be called by server when the OTHER player makes a move
  socket.on('get new game data', function (data) {
    myGameData = data;

    //call a function that does jquery stuff populating board
  })

  socket.on('disconnect', function (myClientID) {
    socket.emit('unsubscribe', myRoom)
    socket.emit('disconnect', myClientID);
  });

  // data in this function should be all game data
  function updateData (data) {
    socket.emit('update game data', data);
  }

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

  // cache jquery things
  let Hand = $('#hand-grid');
  let Board = $('#board-grid');

  // storage for new jquery things
  let HandTiles = [];
  let PlayerDeck = [];
  let Bases = [];

  // jq dom elements
  function startGame (gameData) {

    let drawBoardCells = function (size,wide,high) {
      for (i=0;i<high;i++){
        for (j=0;j<wide;j++){
          let left = size*j;
          let top = size*i;
          let jq = $(`<div class= "cell board-cell" id="${j}-${i}" >`);
          jq.css('left', left);
          jq.css('top', top);
          Board.append(jq);
        }
      }
    }

    drawBoardCells(30,15,15);

    let drawHandCells = function (size,num) {
      for (i=0;i<num;i++){
        let left = size*i;
        let jq = $(`<div class= "cell hand-cell" id= "h-${i}" >`);
        jq.css('left', left);
        Hand.append(jq);
        HandTiles.push(jq);
      }
    }

    drawHandCells(30,4);

    let dealHand = function(gameData) {
      let hand;
      if (iAmPlayer===1) {
        hand = gameData.player1.hand;
      } else {
        hand = gameData.player2.hand;
      }
      HandTiles.forEach((jqcell,i) => {
        jqcell.addClass(`p${iAmPlayer}${hand[i].name}`);
      })

      // console.log("in dealHand, iAmPlayer=",iAmPlayer);
      console.log(gameData);


    }

    dealHand(gameData);

  } // startGame


          // transform: `rotate(${this.props.tilerotation}deg)`,
          // transition: "transform 0.5s"

});
