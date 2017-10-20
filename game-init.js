function gameInit () {

  let game = {
    board: {},
    player1: {},
    player2: {},
    whosturn: 1
  }

  let tiles = ["straight", "cross", "opposite-corners", "one-corner", "two-corners-same-side",
  "left-hook", "right-hook"];

  let codes = ["1010","1212","1122","1100","0111","1011","1110"];

  function buildTileProfiles (p) {
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

  function ranTileNum () {
    return Math.floor(Math.random()*tiles.length);
  }

  function buildDeck(p) {
    let profiles = buildProfiles(p);
    let deckSize = 20; //135
    let deck = [];
    for (let i=0;i<deckSize;i++) {
      let num = ranTileNum();
      deck.push(profiles[num]);
    }
    return deck;
  }

  function drawHand (deck,handsize) {
    let hand = [];
    for (let i=0;i<handsize;i++) {
      hand.push(deck.pop());
    }
    // console.log(hand);
    return hand;
    // console.log('handdrawn');
  }

  function buildPlayer(p) {
    let player = {};
    player.deck = buildDeck(p);
    player.hand = drawHand(player.deck,4);
    player.tilerotation = 0;
    player.bases = [];
    return player;
  }

  ////////////////////

  function randMax(max) {
    return Math.floor(Math.random()*(max+1));
  }

  function gridBorders (bSize) {
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

  function placeBases (num, bSize) {
    let possibleLocations = gridBorders(bSize);
    let bases = [];
    for (let i = 0; i < num; i++) {
      let ran = randMax(possibleLocations.length-1);
      let base = possibleLocations.splice(ran, 1)[0];
      bases.push(base);
    }
    return bases;
  }

  function buildBoard(bsize) {
    let board = {};
    board.p1occupied = [];
    board.p2occupied = [];
    board.bases = placeBases(15,15);
    return board;
  }

  function init() {
    game.player1 = buildplayer(1);
    game.player2 = buildplayer(2);
    game.board = buildBoard(15);
    return game;
  }

  return init();
}



