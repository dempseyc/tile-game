  // replace this with messaging service
  // let $body = $('body');
  // let $uiTargets = $('#ui-targets');
  // let $dataDisplay = $('#data-display');

  let gameData = {};

  // replace this with messaging service
  // let target = $('<form>message:<br><input type="text" name="message"><input type="submit" value="Submit"></form>');

// replace this with messaging service
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
  let myRoom = "room one";
  let iAmPlayer;
  let myGameData = {}; // my deck, my hand, the board, the bases

  // the socket.on() functions are receiving calls from the server
  // socket.emit() is calling functions on the server from the client side

  socket.on('connection', function (ID) {
    myClientID = ID;  // this is socket.id
    console.log('you are connected, client ', myClientID);
    socket.emit('subscribe', myRoom);
  });

  socket.on('disconnect', function (myClientID) {
    socket.emit('unsubscribe', myRoom);
    socket.emit('disconnect', myClientID);
  });

  socket.on('get player number', function (num) {
    iAmPlayer = num;
    console.log("iAmPlayer", iAmPlayer);
  });

  socket.on('get game data', function () {
    socket.emit('get new game data', iAmPlayer);
  });

  socket.on('start game', function (playersData) {
    //startGame should do jquery stuff populating bases and hand tiles
    myGameData = playersData;
    startGame();
  });

  // data argument in this function should be all my game data
  // is it redundant to update myGameData separately?
  function updateData (data) {
    // because data.room needed by server for now
    data.room = myRoom;
    socket.emit('update game data', data);
  }

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

  // cache jquery UI targets
  let Hand = $('#hand-grid');
  let RotateButton = $('#rotate-button');
  let Board = $('#board-grid');

  // storage for new needed jquery elements
  // rather, there would be MyGameData obj storing all this stuff
  let MyHand = [];
  let PlayerDeck = [];
  let BaseContainer = $('<div class= "base-container" ></div>');
  let Bases = [];

// jq dom elements
 let startGame = function () {

    // rather, I would copy gameData and add jquery elements to it,
    // then have functions draw from that gameData and mutate it based on
    // player actions or server info...
    //what classes would you have

    // Base
      // this.locX
      // this.locY
      // this.ownedBy

    // BoardCell
      // this.tile
      // this.profile
      // this.locX
      // this.locY

    // Tile
      // this.player
      // this.rotation
      // this.name
      // this.code
      // this.rotcode //rotcode changes with rotation and changes css rotation transform

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
    };

    drawBoardCells(30,15,15);

    let drawHandCells = function (player,size,num,rot) {
      for (i=0;i<num;i++){
        let tile = {};
        let left = size*i;
        let jq = $(`<div class= "cell hand-cell" id= "h-${i}" >`);
        jq.css('left', left);
        // jq.css('transform:rotate', rot); // i could do this forever
        // it'd be nice, but...
        // jq.css('transition', "transform 0.5s"); // something like this
        tile.id = i;
        tile.jq = jq;
        tile.rotation = 0;
        Hand.append(jq);  // we have put els on the DOM
        MyHand.push(tile);
      };
    };

    drawHandCells(iAmPlayer, 30, 4, 0);

    let dealHand = function() {
      // console.log(JSON.stringify(gameData) + " in dealHand");
      let hand = myGameData.player.hand;

      console.log(hand);

      MyHand.forEach((tile,i) => {
        let jq = tile.jq;
        let imgClassName = `p${iAmPlayer}${hand[i].name}`;
        tile.img = imgClassName;
        //////////////////////////////////////this is where it doesn't work the index
        jq.addClass(imgClassName);
      })
    };

    dealHand();

    let drawBases = function() {
      // this is fine for drawing bases, but what about updating base color and owner?
      let bases = myGameData.board.bases;
      bases.forEach((base,i) => {
        console.log(base);
        let top = 30*base.split('-')[0]-7;
        let left = 30*base.split('-')[1]-7;
        let jq = $(`<div class= "base" id= "b-${i}" profile= "${base}" >`);
        jq.css('left', left);
        jq.css('top', top);
        BaseContainer.append(jq);  // putting more els on the DOM
        Bases.push(jq);            // storing them in an array // can i retrieve profile?
      });
      Board.append(BaseContainer);
    };

    drawBases();
}; // startGame

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
//
// Click Events
//
///////////////////////////////////////////////////////////////////////////////////////


// pre-requisites
// client should have a player number, a deck of tiles, and a board of cells and bases
// those comprise the clients' holdings
// each client updates each others board
// action on a tile in ones hand will only result in a legal move, and let the
// play continue..  when a player has captured the majority of bases, the game ends.
//
// what can a tile do?
//
// it can occupy a cell on the board
// it can be a member ones hand
// it has properties of tlbr and can be rotated accordingly
//
// it can be pulled from ones hand to the board
// it can be placed next to or on top of another tile on the board if its profile matches
// it can capture a base for ones side or anothers side
// capturing bases is the point of the game
//
// what can a tile not do?
//
// it can not be taken back into the players deck after being placed on the board
// it can not occupy the board in a mis-matched way according to its profile
// it can not be placed in unoccupied territory, i.e., it must be placed near to another

// i think that's all

// notes for build 2
    //dealDeck(gameData); ??
    // ???????  after all this is set up, i can send only moves over server??
    // no server will need to update bases captured also
    // win state when majority of bases are captured
    // maybe register your win with initials
