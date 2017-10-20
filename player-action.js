function recieveGameData (data) {
  console.log("gameDataReceived");
}

function sendGameDatat (data) {
  console.log("gameDataSent");
}

function chooseTile (hand) {
  console.log("tile chosen");
}

function putDownTile (location) {
  console.log("tile placed");
}

export {chooseTile,putDownTile}


// when you click on one of your hand tiles,
// the pointertile picks up qualities of that tile,

// the tile you click on turns white

// then when you click on a boardcell, the board is populated
// with the profile of the pointertile and switchplayers is called

