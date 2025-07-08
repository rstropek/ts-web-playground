/**
 * TIC-TAC-TOE GAME
 * =================
 * This is a complete tic-tac-toe game built with TypeScript and p5.js.
 * Players take turns clicking on a 3x3 grid to place X's and O's.
 * The first player to get 3 in a row (horizontally, vertically, or diagonally) wins!
 */

// ===== CONSTANTS =====
// These values never change during the game, so we use 'const'
const GRID_SIZE    = 300;             // Total size of the game board (300x300 pixels)
const CELL_SIZE    = GRID_SIZE / 3;   // Each cell is 1/3 of the grid (100x100 pixels)
const LINE_WEIGHT  = 3;               // How thick the grid lines are (3 pixels)

// ===== GAME STATE VARIABLES =====
// These variables track the current state of our game
let board: string[];                 // An array of 9 strings representing the 3x3 grid
                                     // Each element can be "X", "O", or "" (empty)
                                     // Index 0-2 = top row, 3-5 = middle row, 6-8 = bottom row

let currentPlayer: "X" | "O";        // Which player's turn it is (either "X" or "O")
                                     // The ": "X" | "O"" is a TypeScript type annotation
                                     // It means this variable can ONLY hold "X" or "O"

let gameEnded: boolean;              // true when the game is over, false when still playing
let resultMessage: string;          // The message to show when the game ends

/**
 * SETUP FUNCTION
 * ==============
 * This is a special p5.js function that runs ONCE when the program starts.
 * Think of it like the initialization phase of our game.
 */
function setup() {
  // Create a canvas (drawing area) that's 300x350 pixels
  // The extra 50 pixels at the bottom are for showing game status
  createCanvas(GRID_SIZE, GRID_SIZE + 50);
  
  // Initialize the game for the first time
  resetGame();
}

/**
 * DRAW FUNCTION
 * =============
 * This is another special p5.js function that runs continuously (many times per second).
 * It's like the heartbeat of our program - it redraws everything on the screen.
 * Even if nothing changes, we redraw to keep the display fresh.
 */
function draw() {
  background("white");    // Clear the screen with white background
  drawGrid();            // Draw the 3x3 grid lines
  drawMarks();           // Draw all the X's and O's on the board
  drawStatus();          // Draw the status message at the bottom
}

/**
 * MOUSE CLICKED FUNCTION
 * ======================
 * This special p5.js function runs whenever the user clicks the mouse.
 * This is where we handle the main game logic: placing X's and O's.
 */
function mouseClicked() {
  // If the game is over, clicking anywhere resets the game
  if (gameEnded) {
    resetGame();
    return;  // Exit the function early - don't do anything else
  }

  // Figure out which cell the user clicked on
  // mouseX and mouseY are p5.js variables that tell us where the mouse was clicked
  const row = Math.floor(mouseY / CELL_SIZE);  // Which row (0, 1, or 2)
  const col = Math.floor(mouseX / CELL_SIZE);  // Which column (0, 1, or 2)
  
  // Convert 2D position (row, col) to 1D array index
  // Row 0: indices 0,1,2  |  Row 1: indices 3,4,5  |  Row 2: indices 6,7,8
  const idx = row * 3 + col;

  // Only allow marks inside the 3×3 grid on empty cells
  // We check: 1) Click is in valid range, 2) Cell is empty
  if (row >= 0 && row < 3 && col >= 0 && col < 3 && board[idx] === "") {
    // Place the current player's mark in the clicked cell
    board[idx] = currentPlayer;
    
    // Check if this move won the game
    const winner = checkWin();
    if (winner === "X" || winner === "O") {
      // Someone won! End the game
      gameEnded = true;
      resultMessage = `Player ${winner} wins!`;
    } else if (winner === "tie") {
      // Board is full but no winner - it's a tie
      gameEnded = true;
      resultMessage = "It's a tie!";
    } else {
      // Game continues - switch to the other player
      // This is a shorthand way to switch between "X" and "O"
      currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
  }
}

/**
 * DRAW GRID FUNCTION
 * ==================
 * This function draws the tic-tac-toe grid (the # symbol shape).
 * We draw 2 vertical lines and 2 horizontal lines to create 9 cells.
 */
function drawGrid() {
  strokeWeight(LINE_WEIGHT);  // Set line thickness
  stroke("black");            // Set line color to black
  
  // Draw vertical and horizontal lines
  // i goes from 1 to 2 (we need 2 lines in each direction)
  for (let i = 1; i < 3; i++) {
    // Vertical lines: from top to bottom at positions 100px and 200px
    line(i * CELL_SIZE, 0, i * CELL_SIZE, GRID_SIZE);
    
    // Horizontal lines: from left to right at positions 100px and 200px  
    line(0, i * CELL_SIZE, GRID_SIZE, i * CELL_SIZE);
  }
}

/**
 * DRAW MARKS FUNCTION
 * ===================
 * This function draws all the X's and O's that players have placed on the board.
 * It loops through our board array and draws each mark in the correct position.
 */
function drawMarks() {
  textSize(64);               // Make the X's and O's big (64 pixel font)
  textAlign(CENTER, CENTER);  // Center the text in each cell
  fill("black");              // Make the text black
  
  // Loop through all 9 positions in our board array
  for (let i = 0; i < 9; i++) {
    const mark = board[i];  // Get what's in this cell ("X", "O", or "")
    
    // Only draw something if the cell isn't empty
    if (mark) {
      // Convert array index back to x,y coordinates for drawing
      // i % 3 gives us the column (remainder when divided by 3)
      // Math.floor(i / 3) gives us the row (how many complete rows fit)
      const x = (i % 3) * CELL_SIZE + CELL_SIZE / 2;        // X position (center of cell)
      const y = Math.floor(i / 3) * CELL_SIZE + CELL_SIZE / 2;  // Y position (center of cell)
      
      // Draw the mark (X or O) at the calculated position
      text(mark, x, y);
    }
  }
}

/**
 * DRAW STATUS FUNCTION
 * ====================
 * This function draws the status message at the bottom of the screen.
 * It shows whose turn it is, or who won the game.
 */
function drawStatus() {
  noStroke();                 // Don't draw outline around the text
  textSize(24);               // Smaller text for the status message
  textAlign(CENTER, CENTER);  // Center the text horizontally and vertically
  fill("black");              // Black text
  
  // Choose what message to show based on game state
  const msg = gameEnded ? resultMessage : `Player ${currentPlayer}'s turn`;
  
  // Draw the message in the bottom area (25 pixels down from the grid)
  text(msg, GRID_SIZE / 2, GRID_SIZE + 25);
}

/**
 * CHECK WIN FUNCTION
 * ==================
 * This function checks if anyone has won the game or if it's a tie.
 * It returns "X" if X wins, "O" if O wins, "tie" if board is full, or "" if game continues.
 * 
 * In tic-tac-toe, you win by getting 3 in a row horizontally, vertically, or diagonally.
 */
function checkWin(): "X" | "O" | "tie" | "" {
  // All possible winning combinations (lines of 3)
  // Each array contains the indices that form a winning line
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],      // Horizontal rows (top, middle, bottom)
    [0,3,6], [1,4,7], [2,5,8],      // Vertical columns (left, center, right)  
    [0,4,8], [2,4,6]                // Diagonal lines (top-left to bottom-right, top-right to bottom-left)
  ];
  
  // Check each possible winning line
  for (const [a,b,c] of lines) {
    // If all three positions in this line have the same mark (and aren't empty)
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as "X" | "O";  // Return the winner ("X" or "O")
    }
  }

  // No winner found - check if board is full (tie game)
  if (board.every(cell => cell !== "")) {
    return "tie";  // Every cell is filled, so it's a tie
  }

  // Game is still in progress
  return "";
}

/**
 * RESET GAME FUNCTION
 * ===================
 * This function resets the game back to its starting state.
 * It's called when the program starts and when a player clicks after a game ends.
 */
function resetGame() {
  // Create a new array with 9 empty strings - one for each cell
  // Array(9) creates an array with 9 undefined elements
  // .fill("") fills all elements with empty strings
  board = Array(9).fill("");
  
  // Always start with player X
  currentPlayer = "X";
  
  // Game hasn't ended yet
  gameEnded = false;
  
  // Clear any previous result message
  resultMessage = "";
}
