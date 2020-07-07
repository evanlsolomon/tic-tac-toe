let gameInProgress = false;

document.getElementById("start-game-btn")
        .addEventListener("click", event => runGame(event) );

function rematch(event){
    event.preventDefault();
    gameInProgress = true;
    DISPLAY.placeBoxes();
    GAME.clearGame();
    PLAY.playCount = 0;
    DISPLAY.loadBoardListeners();
    DISPLAY.promptTurn();
}

function runGame(event){
    event.preventDefault();
    gameInProgress = true;
    DISPLAY.placeBoxes();
    PLAY.createPlayers(); 
    PLAY.playCount = 0;
    DISPLAY.loadBoardListeners();
    DISPLAY.promptTurn();
}

const DISPLAY = (() => {
    
    const playerPromptElement = (player) => document.getElementById(`${player.getTeam()}Player`);
    
    const promptTurn = (player = PLAY.currentPlayer()) => {
         playerPromptElement(player)
         .innerText = `${player.getName()}, it's your turn`};
    
    const squareElements = document.getElementsByClassName('square')
    const clearPrompt = (player = PLAY.currentPlayer()) => playerPromptElement(player).innerText="";
    
    
    function showGameSetup(event){
        event.preventDefault();
        hideSquares();
        document.getElementById("setup-container").style.display = "flex";
        document.getElementById("new-game-setup").style.display = "block";
        document.getElementById("next-game-choice").style.display = "none";
    }
    
    function hideSquares(){
        for(square of squareElements){
            square.style.display = "none";
            square.innerText = "";
        }
    }
    
    function rematchOrNewGame(){
        clearBoardListeners();
        hideSquares();
        GAME.clearGame();
        document.getElementById("setup-container").style.display = "flex";
        document.getElementById("new-game-setup").style.display = "none";
        document.getElementById("next-game-choice").style.display = "block";
        document.getElementById("game-setup-btn")
            .addEventListener("click", event => showGameSetup(event) );    
        document.getElementById("rematch-btn")
            .addEventListener("click", event => rematch(event) );        
    }
    
    const placeBoxes = () => {
        document.getElementById("setup-container").style.display = "none";
        for(square of squareElements){
            square.style.display = "block";
            square.innerText = "";
        }
    }
    
    const clearBoardListeners = () => {
        for (square of squareElements){
            square.removeEventListener("click", PLAY.executePlayerTurn);
        } 
    }
    
    //add event listeners to squares
    const loadBoardListeners = () => {
        for (square of squareElements){
            if (square.innerText === ""){
                square.addEventListener("click", PLAY.executePlayerTurn,{once: true});
            }
        } 
    }

    return {loadBoardListeners, promptTurn, clearPrompt, placeBoxes, rematchOrNewGame}
})();


// Player factory 
const Player = (name, team) => {
    const getName = () => name;
    const getTeam = () => team;
    let points = 0;

    const increasePoints = x => {
        points += x;
    }
    return{getName, getTeam, increasePoints}
};

// PLAY Module for creating players and processing their turns
const PLAY = (() => {

    let playCount = 0;
    const PLAYERS = [];
    const currentPlayer = () => {
        return PLAYERS[playCount%2]
    };
    
    const createPlayers = () => {
        //create two players and put them in 
        const playerInputForm = document.getElementById("new-game-setup");
        let xPlayer = playerInputForm["xPlayerName"].value;
        let oPlayer = playerInputForm["oPlayerName"].value;
        PLAYERS.push(Player(xPlayer,"x"));
        PLAYERS.push(Player(oPlayer,"o"));
        // try PLAYERS = [Player(xPlayer, "x", oPlayer,"o")];
    }
    
    const executePlayerTurn = (event) => {
        let player = currentPlayer();
        let team = player.getTeam();
        let squareId = Number(event.target.id.charAt(6));
        GAME.fillBoardSquare(squareId, team) 
        event.target.innerText = team; 
        DISPLAY.clearPrompt();
        playCount++;
        // console.log(`playcount: ${playCount}, board: `, board);
        DISPLAY.promptTurn();
        if (GAME.hasWinner()) {
            gameInProgress = false;
            console.log(player.getName(), player.getTeam(), "has won the game")
            DISPLAY.rematchOrNewGame();
        }else if (playCount === 9){
            gameInProgress = false;
            console.log("No winner --- it's a tie.")
            DISPLAY.rematchOrNewGame();
        }
    }

    return {executePlayerTurn, createPlayers, currentPlayer, playCount}
})();




// Game module for checking for winners and keeping track of players' moves
const GAME = (() => {
    let board = [undefined, undefined, undefined,
                    undefined, undefined, undefined,
                    undefined, undefined, undefined];
    
    const fillBoardSquare = (squareNumber, team) => {
        board[squareNumber-1] = team; 
    }
    
    const clearGame = () => {
        DISPLAY.clearPrompt();
        playCount = 0;
        for(square in board) {
            board[square] = undefined;
        }
    }
    
    const hasWinner = () => {
        const horizontalRows = [0, 3, 6];
        const verticalColumns = [0, 1, 2];
        const diagonalStart1 = 0;
        const diagonalStart2 = 2;
        // check for horizontal wins
        for(slot of horizontalRows){
            if(board[slot] !== undefined){
                if(board[slot] === board[slot+1] && board[slot] === board[slot+2] ){
                    return true;
                }
            }
        }
    
        // check for vertical wins
        for(slot of verticalColumns){
            if(board[slot] !== undefined){
                if(board[slot] === board[slot+3] && board[slot] === board[slot+6] ){
                    return true;
                }
            }
        }
    
        //check for diagonal wins      
        if(board[diagonalStart1] !== undefined){
            if(board[diagonalStart1] === board[diagonalStart1+4] && board[diagonalStart1] === board[diagonalStart1+8] ){
                return true;
            }
        }
        if(board[diagonalStart2] !== undefined){
            if(board[diagonalStart2] === (board[diagonalStart2+2] && board[diagonalStart2] ===  board[diagonalStart2+4]) ){
                return true;
            }
        }
        return false;
    }
    return {hasWinner, clearGame, fillBoardSquare}
})();
