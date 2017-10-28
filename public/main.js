  // replace this with messaging service
  // let $body = $('body');
  // let $uiTargets = $('#ui-targets');
  // let $dataDisplay = $('#data-display');


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

  let gameData = {};
/////////////////////////////////////////////
/////////////////////////////////////////////
//// socket stuff in client

  var socket = io.connect();
  // console.log(socket);

  let myClientID;
  let myRoom = "room one";
  let iAmPlayer;
  let whosTurn = 1;
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

  socket.on('get init data', function () {
    socket.emit('get your game data', iAmPlayer);
  });

  socket.on('start game', function (playersData) {
    myGameData = playersData;
    startGame();
  });

  socket.on('get game data', function (data) {
    if (whosTurn === 1) { whosTurn=2; } else { whosTurn=1; }
    console.log('get game data called');
    myGameData.board = data.board;
    updateBoard();
  });

function updateBoard () {
  myGameData.board.mat.forEach((row, i) => {
    row.forEach((cell, j) => {
      let target = $(`#${j}-${i}`);
      if (cell.hasOwnProperty('img') && target.children().length === 0) {
        let jq = $(`<div class= "cell board-tile ${cell.img}" >`);
        jq.css('transform', 'rotate('+cell.rotation+'deg)');
        target.append(jq);
      }
    });
  });
  console.log ("player "+whosTurn+"'s turn");
}

function sendMove (data) {
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
  let Board = $('#board-grid');
  let RotateButton = $('#rotate-button');
  let rotation = 0;
  RotateButton.text(rotation+"º");


  // storage for new needed jquery elements
  let MyHand = [];
  let PlayerDeck = [];
  let BaseContainer = $('<div class= "base-container" ></div>');
  let Bases = [];

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
//
// Click Events
//
///////////////////////////////////////////////////////////////////////////////////////


RotateButton.click(rotateTiles);

function rotateString(str) {
  let len = str.length;
  let last = str.substring(len-1);
  let first = str.substring(0,len-1);
  return last + first;
}

function rotateTiles () {
  rotation+=90;
  if (rotation===360){rotation=0;}
  RotateButton.text(rotation+"º");
  console.log("rotate called");
  MyHand.forEach((tile,i) => {
    jq = tile.jq;
    tile.rotation = rotation;
    tile.rotcode = rotateString(tile.rotcode);
    console.log(tile.rotcode);
    jq.css('transform', 'rotate('+rotation+'deg)');
  });
}

    // repaint button
  REPAINT = $('#re-paint')
  REPAINT.click(function(){
    startGame();
  });

function newTile(i) {
  let tile = PlayerDeck.pop();
  // let left = size*i;
  let jq = $(`<div class= "cell hand-cell" id= "h-${i}" >`)
    .draggable({
      helper: "clone"
    });
  let imgClassName = `p${iAmPlayer}${tile.name}`;
  tile.img = imgClassName;
  jq.addClass(imgClassName);
  tile.rotation = rotation;
  jq.css('transform', 'rotate('+tile.rotation+'deg)');
  jq.css('transition', 'transform 0.5s');
  tile.id = i;
  tile.jq = jq;
  if (i===0) {
    jq.insertBefore(`#hand-grid div:eq(${i+1})`);
  } else {
    jq.insertAfter(`#hand-grid div:eq(${i})`);
  }
  return tile;
}

function changeBoardData(tile,loc) {
  let col = loc.split('-')[0];
  let row = loc.split('-')[1];
  tile.jq = {};
  // let imgClassName = `p${iAmPlayer}${tile.name}`;
  // tile.img = imgClassName;
  // tile.rotation = rotation;
  myGameData.board.mat[row][col] = tile;
  sendMove(myGameData);
}


// jq dom elements
let startGame = function () {

  let drawBoardCells = function (size,wide,high) {
    for (i=0;i<high;i++){
      for (j=0;j<wide;j++){
        let left = size*j;
        let top = size*i;
        // defines a function that is called when draggable is dropped
        let jq = $(`<div class= "cell board-cell" id="${j}-${i}" >`)
          .droppable({
            drop: function(e, ui){
              console.log(e, ui, "in drop function");
              let str = ui.draggable.attr('id');
              let id = Number(str.split('-')[1]);
              let droppedTile = MyHand[id];
              let loc = $(e.target).attr('id');
              changeBoardData(droppedTile,loc);
              let newHandTile = newTile(id);
              MyHand.splice(id,0, newHandTile);
              MyHand.splice(id+1,1);
              ui.draggable.detach();
              // ui.draggable.removeClass('hand-cell');
              // ui.draggable.addClass('board-tile');
              // ui.draggable.detach().appendTo($(e.target));
              // function changing base occupancy
              // console.log(myGameData.board, "board in drop function");
            }
            });
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
      // let left = size*i;
      let jq = $(`<div class= "cell hand-cell" id= "h-${i}" >`)
        .draggable({
          helper: "clone"
        });
      // jq.css('left', left);
      tile.rotation = 0;
      jq.css('transform', 'rotate('+tile.rotation+'deg)');
      jq.css('transition', 'transform 0.5s');
      tile.id = i;
      tile.jq = jq;
      Hand.append(jq);  // we have put els on the DOM
      MyHand.push(tile);
    };
  };

  drawHandCells(iAmPlayer, 30, 4, 0);

  // btw
  PlayerDeck = myGameData.player.deck;

  let dealHand = function() {
    // console.log(JSON.stringify(gameData) + " in dealHand");
    let hand = myGameData.player.hand;

    console.log(hand);

    MyHand.forEach((tile,i) => {
      tile.type = hand[i].type;
      tile.code = hand[i].code;
      tile.rotcode = hand[i].rotcode;
      tile.name = hand[i].name;
      let jq = tile.jq;
      let imgClassName = `p${iAmPlayer}${tile.name}`;
      tile.img = imgClassName;
      jq.addClass(imgClassName);
    })
  };

  dealHand();

  let drawBases = function() {
    // this is fine for drawing bases, but what about updating base color and owner?
    let bases = myGameData.board.bases;
    bases.forEach((base,i) => {
      console.log(base);
      let top = 30*base.loc.split('-')[0]-7;
      let left = 30*base.loc.split('-')[1]-7;
      let jq = $(`<div class= "base" id= "b-${i}" profile= "${base.loc}" >`);
      jq.css('left', left);
      jq.css('top', top);
      BaseContainer.append(jq);  // putting more els on the DOM
      Bases.push(jq);            // storing them in an array // can i retrieve profile?
    });
    Board.append(BaseContainer);
  };

  drawBases();
}; // startGame


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
