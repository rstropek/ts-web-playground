// Constants for the game grid
const GRID_SIZE = 300;           // The size of the Tic Tac Toe grid
const CELL_SIZE = GRID_SIZE / 3; // The size of each cell in the grid
const LINE_THICKNESS = 3;        // Thickness of the grid lines

// Canvas size
const CANVAS_WIDTH = GRID_SIZE; // Width of the canvas
const CANVAS_HEIGHT = GRID_SIZE + 50; // Height of the canvas (extra space for messages)

// Variables to store the state of each cell
let cell1: string = ""; // A1
let cell2: string = ""; // B1
let cell3: string = ""; // C1   
let cell4: string = ""; // A2
let cell5: string = ""; // B2
let cell6: string = ""; // C2
let cell7: string = ""; // A3
let cell8: string = ""; // B3
let cell9: string = ""; // C3

// Variable to keep track of the current player ("X" or "O")
let currentPlayer: string = "X";

// Variable to keep track of the game state (ongoing or ended)
let gameEnded: boolean = false;

// Variable to store the game result message
let resultMessage: string = "";

function setup() {
    // Create the canvas with specified width and height
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Remember: The draw function is called repeatedly (once per frame) to update the display.
// In this exercise, we redraw the entire game board in each frame.
function draw() {
    background("white");

    // Draw the grid lines
    strokeWeight(LINE_THICKNESS);
    stroke("black");
    line(CELL_SIZE, 0, CELL_SIZE, GRID_SIZE); // vertical line 1
    line(2 * CELL_SIZE, 0, 2 * CELL_SIZE, GRID_SIZE); // vertical line 2
    line(0, CELL_SIZE, GRID_SIZE, CELL_SIZE); // horizontal line 1
    line(0, 2 * CELL_SIZE, GRID_SIZE, 2 * CELL_SIZE); // horizontal line 2

    // Set text size and alignment for drawing the symbols (X and O)
    textSize(64);
    textAlign(CENTER, CENTER);
    fill("black");

    // Draw symbols in each cell if they are not empty
    if (cell1 !== "") {
        text(cell1, CELL_SIZE / 2, CELL_SIZE / 2);
    }
    if (cell2 !== "") {
        text(cell2, CELL_SIZE * 1.5, CELL_SIZE / 2);
    }
    if (cell3 !== "") {
        text(cell3, CELL_SIZE * 2.5, CELL_SIZE / 2);
    }
    if (cell4 !== "") {
        text(cell4, CELL_SIZE / 2, CELL_SIZE * 1.5);
    }
    if (cell5 !== "") {
        text(cell5, CELL_SIZE * 1.5, CELL_SIZE * 1.5);
    }
    if (cell6 !== "") {
        text(cell6, CELL_SIZE * 2.5, CELL_SIZE * 1.5);
    }
    if (cell7 !== "") {
        text(cell7, CELL_SIZE / 2, CELL_SIZE * 2.5);
    }
    if (cell8 !== "") {
        text(cell8, CELL_SIZE * 1.5, CELL_SIZE * 2.5);
    }
    if (cell9 !== "") {
        text(cell9, CELL_SIZE * 2.5, CELL_SIZE * 2.5);
    }

    noStroke();
    textSize(24);
    textAlign(CENTER, CENTER);
    if (gameEnded) {
        // If the game has ended, display the result message
        text(resultMessage, CANVAS_WIDTH / 2, GRID_SIZE + 25);
    } else {
        // Display the current player's turn
        fill("black");
        text("Player " + currentPlayer + "'s turn", CANVAS_WIDTH / 2, GRID_SIZE + 25);
    }
}

function mouseClicked() {
    // Only handle clicks if the game has not ended
    if (!gameEnded) {
        // Determine which cell was clicked
        let row = Math.floor(mouseY / CELL_SIZE);
        let col = Math.floor(mouseX / CELL_SIZE);
        let cellNumber = row * 3 + col + 1; // Calculate the clicked cell number

        // Check if the click is inside the grid and the clicked cell is empty
        if (row >= 0 && row < 3 && col >= 0 && col < 3) {
            if (cellNumber === 1 && cell1 === "") {
                cell1 = currentPlayer;
            } else if (cellNumber === 2 && cell2 === "") {
                cell2 = currentPlayer;
            } else if (cellNumber === 3 && cell3 === "") {
                cell3 = currentPlayer;
            } else if (cellNumber === 4 && cell4 === "") {
                cell4 = currentPlayer;
            } else if (cellNumber === 5 && cell5 === "") {
                cell5 = currentPlayer;
            } else if (cellNumber === 6 && cell6 === "") {
                cell6 = currentPlayer;
            } else if (cellNumber === 7 && cell7 === "") {
                cell7 = currentPlayer;
            } else if (cellNumber === 8 && cell8 === "") {
                cell8 = currentPlayer;
            } else if (cellNumber === 9 && cell9 === "") {
                cell9 = currentPlayer;
            }

            // Check if the current player has won
            if (
                (cell1 === currentPlayer && cell2 === currentPlayer && cell3 === currentPlayer) ||
                (cell4 === currentPlayer && cell5 === currentPlayer && cell6 === currentPlayer) ||
                (cell7 === currentPlayer && cell8 === currentPlayer && cell9 === currentPlayer) ||
                (cell1 === currentPlayer && cell4 === currentPlayer && cell7 === currentPlayer) ||
                (cell2 === currentPlayer && cell5 === currentPlayer && cell8 === currentPlayer) ||
                (cell3 === currentPlayer && cell6 === currentPlayer && cell9 === currentPlayer) ||
                (cell1 === currentPlayer && cell5 === currentPlayer && cell9 === currentPlayer) ||
                (cell3 === currentPlayer && cell5 === currentPlayer && cell7 === currentPlayer)
            ) {
                gameEnded = true;
                resultMessage = "Player " + currentPlayer + " wins!";
            } else if (
                cell1 !== "" && cell2 !== "" && cell3 !== "" &&
                cell4 !== "" && cell5 !== "" && cell6 !== "" &&
                cell7 !== "" && cell8 !== "" && cell9 !== ""
            ) {
                gameEnded = true;
                resultMessage = "It's a tie!";
            } else {
                // Switch player
                currentPlayer = currentPlayer === "X" ? "O" : "X";
            }
        }
    } else {
        // If the player clicks after the game has ended, reset the game
        // so that the player can start a new game.
        cell1 = "";
        cell2 = "";
        cell3 = "";
        cell4 = "";
        cell5 = "";
        cell6 = "";
        cell7 = "";
        cell8 = "";
        cell9 = "";

        gameEnded = false;
        resultMessage = "";
        currentPlayer = "X";
    }
}
