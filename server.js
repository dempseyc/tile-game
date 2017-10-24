const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

// routing
app.use(express.static(path.join(__dirname, 'public')));

// config
// add middlewares here
app.set('view engine','html');

///////////////////////////////////////////////////
///////////////////////////////////////////////////

let gameInit = function () {

  let game = {
    board: {},
    player1: {},
    player2: {},
    whosturn: 1
  }

  let tiles = ["straight", "cross", "opposite-corners", "one-corner", "two-corners-same-side",
  "left-hook", "right-hook"];

  let codes = ["1010","1212","1122","1100","0111","1011","1110"];

  let buildTileProfiles = function (p) {
    let codelist = codes;
    let p2codes = codelist.map(str => {
      let arr=str.split("");
      let arr2=arr.map(n => {

        if (n==="1") { return "2";}
        else if (n==="2") { return "1";}
        else {return "0";}

      })
      return arr2.join("");
    })
    if (p===2) {codelist = p2codes;}
    let profs = tiles.map((tile,i) => {
      return {type: i,code:codelist[i], rotcode:codelist[i], name:tiles[i]};
    });
    return profs;
  }

  let ranTileNum  = function () {
    return Math.floor(Math.random()*tiles.length);
  }

  let buildDeck = function (p) {
    let profiles = buildTileProfiles(p);
    let deckSize = 20; //135
    let deck = [];
    for (let i=0;i<deckSize;i++) {
      let num = ranTileNum();
      deck.push(profiles[num]);
    }
    return deck;
  }

  let drawHand = function (deck,handsize) {
    let hand = [];
    for (let i=0;i<handsize;i++) {
      hand.push(deck.pop());
    }
    // console.log(hand);
    return hand;
    // console.log('handdrawn');
  }

  let buildPlayer = function (p) {
    let player = {};
    player.deck = buildDeck(p);
    player.hand = drawHand(player.deck,4);
    player.tilerotation = 0;
    player.bases = [];
    return player;
  }

  ////////////////////

  let randMax = function (max) {
    return Math.floor(Math.random()*(max+1));
  }

  let gridBorders = function (bSize) {
    let borderArray = [];
    // horizontal borders
    for (let i = 0; i < bSize-1; i++) {
      for (let j = 0; j < bSize+1; j++) {
        borderArray.push(`${i+0.5}-${j}`);
      }
    }
    // vertical borders
    for (let i = 0; i < bSize+1; i++) {
      for (let j = 0; j < bSize-1; j++) {
        borderArray.push(`${i}-${j+0.5}`);
      }
    }
    return borderArray;
  }

  let placeBases = function (num, bSize) {
    let possibleLocations = gridBorders(bSize);
    let bases = [];
    for (let i = 0; i < num; i++) {
      let ran = randMax(possibleLocations.length-1);
      let base = possibleLocations.splice(ran, 1)[0];
      bases.push(base);
    }
    return bases;
  }

  let buildBoard = function (bsize) {
    let board = {};
    board.p1occupied = [];
    board.p2occupied = [];
    board.bases = placeBases(15,15);
    return board;
  }

  let init = function () {
    game.player1 = buildPlayer(1);
    game.player2 = buildPlayer(2);
    game.board = buildBoard(15);
    // game.whosturn = 1 initially
    return game;
  }

  return init();
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////

// socket stuff

// io automatically updates an io.sockets object, btw
const io = require('socket.io')(server);

server.listen(port, function () {
  console.log(`server listening at port ${port}`);
});


// a place for server data
let clients = [];
let rooms = [];
let serverGameData = {
  games: []
}

// io.sockets is opening a closure where client side functions calls can be received
io.sockets.on('connection', function (socket) {

  let ID = socket.id;

  clients.push(socket);

  // in the server here, socket.on() functions are recieving calls from the clients
  socket.on('disconnect', function (clientID) {
    clients.splice(clientID, 1);
    console.log(`client ${clientID} disconected, number of clients = ${clients.length}`);
  });

  console.log(`client socket connected number of clients = ${clients.length}`);
  socket.emit('connection',  ID );


  // why is room given by client?  it should be assigned by server
  // in build 2 it will be so
  socket.on('subscribe', function(room){
    socket.emit('get player number', clients.length);
    socket.join(room);
    console.log("joining room", room);
    if (clients.length===2) {
      // json .parse .stringify stuff copies the obj returned from gameInit
      serverGameData.games.push(JSON.parse(JSON.stringify(gameInit())));
      console.log("game initiated");

      // where start game is emitted, will need playernum in build 2
      io.sockets.emit('start game', serverGameData.games[0]);
    }
  });

  socket.on('unsubscribe', function(room) {
    console.log('leaving room', room);
    socket.leave(room);
  });

  socket.on('update game data', function(data) {
    // relies on data.room, added that in client script... is it working?
    console.log('Making my move!', data);  // data here should be the same as game
    io.sockets.in(data.room).emit('get new game data', data);
  });

});

// rebuild notes for later,

