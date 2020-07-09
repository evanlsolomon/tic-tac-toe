// Improvements to be made:
// Gameplay / Logic:
// Change X's and O's to always show player name
// Keep score of wins?
// Upon win, insert congratulatory message

// Style:
// Move entire board into the center of the window

document.getElementById("start-game-btn")
        .addEventListener("click", event => runGame(event) );

function rematch(event){
    event.preventDefault();
    GAME.clearGame();
    DISPLAY.startGame();
    
}

function runGame(event){
    event.preventDefault();
    PLAY.createPlayers(); 
    DISPLAY.startGame();
}

const DISPLAY = (() => {
    
    const promptTurn = (player = PLAY.currentPlayer()) => {
        playerPromptElement(player)
        .innerText = `${player.getName()}, it's your turn`};
        
    const playerPromptElement = (player) => document.getElementById(`${player.getTeam()}Player`);
    const squareElements = document.getElementsByClassName('square') 
    const clearPrompt = (player = PLAY.currentPlayer()) => playerPromptElement(player).innerText="";
    const scoreBoardDisplay = (status) => document.getElementById("score-board").style.display = status;
    const newPlayersInputDisplay = (status) => document.getElementById("new-game-setup").style.display = status;
    const gameSetupDisplay = (status) => document.getElementById("setup-container").style.display = status;
    const nextGameChoiceDisplay = (status, message = "") => {
        document.getElementById("next-game-choice").style.display = status;
        document.getElementById("congrat-message").innerText = message;
    };
    const rematchOrNewGame = (congratMessage) => {
        clearBoardListeners();
        hideSquares();
        GAME.clearGame();
        scoreBoardDisplay("none");
        gameSetupDisplay("flex");
        nextGameChoiceDisplay("block", congratMessage);
        document.getElementById("game-setup-btn").addEventListener(
            "click", event => showGameSetup(event) );    
        document.getElementById("rematch-btn").addEventListener(
            "click", event => rematch(event) );        
    }

    const startGame = () => {
        gameSetupDisplay("none");
        placeBoxes();
        loadBoardListeners();
        scoreBoardDisplay("block");
        newPlayersInputDisplay("none");
        promptTurn();
    }
     
    const placeBoxes = () => {
        for(square of squareElements){
            square.style.display = "block";
            square.innerText = "";
            square.style.paddingBottom = "100%";
        }
    }
    
    const clearBoardListeners = () => {
        for (square of squareElements){
            square.removeEventListener("click", PLAY.executePlayerTurn);
        } 
    }

    const markSquare = (event, team) => {
        console.log(event.target)
        event.target.innerText = team.toUpperCase();
        event.target.style.paddingBottom = 0;
    }

    function hideSquares(){
        for(square of squareElements){
            square.style.display = "none";
            square.innerText = "";
        }
    }

    
    function showGameSetup(event){
        event.preventDefault();
        newPlayersInputDisplay("block");
        nextGameChoiceDisplay("none");
    }

    //add event listeners to squares
    function loadBoardListeners () {
        for (square of squareElements){
            if (square.innerText === ""){
                square.addEventListener("click", PLAY.executePlayerTurn,{once: true});
            }
        } 
    }

    return {promptTurn, clearPrompt, rematchOrNewGame, markSquare, startGame}
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
    let PLAYERS = [];
    const currentPlayer = () => {
        return PLAYERS[playCount%2]
    };
    
    //create two players and put them in 
    const createPlayers = () => {
        let playerInputForm = document.getElementById("new-game-setup");
        let xPlayer = playerInputForm["xPlayerName"].value;
        let oPlayer = playerInputForm["oPlayerName"].value;
        PLAYERS = [Player(xPlayer, "x"), Player(oPlayer,"o")];
    }
    
    const executePlayerTurn = (event) => {
        let player = currentPlayer();
        let team = player.getTeam();
        let squareId = Number(event.target.id.charAt(6));
        GAME.fillBoardSquare(squareId, team) 
        DISPLAY.markSquare(event, team);
        DISPLAY.clearPrompt();
        playCount++;
        // console.log(`playcount: ${playCount}, board: `, GAME.board);
        DISPLAY.promptTurn();
        if (GAME.hasWinner()) {
            gameInProgress = false;
            console.log(player.getName(), player.getTeam(), "has won the game")
            DISPLAY.rematchOrNewGame(`${player.getName()} - team ${player.getTeam()}'s, has won the game.`);
            playCount = 0;
        }else if (playCount === 9){
            gameInProgress = false;
            console.log("No winner --- it's a tie.")
            DISPLAY.rematchOrNewGame("No winner --- it's a tie.");
            playCount = 0;
        }
    }

    return {executePlayerTurn, createPlayers, currentPlayer, playCount, PLAYERS}
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
            if(board[diagonalStart2] === board[diagonalStart2+2] && board[diagonalStart2] ===  board[diagonalStart2+4] ){
                return true;
            }
        }
        return false;
    }
    return {hasWinner, clearGame, fillBoardSquare}
})();
