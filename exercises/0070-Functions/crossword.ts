/**
 * Animal Crossword Game
 *
 * This is a crossword puzzle game where players guess letters to reveal animal names.
 * The game highlights a vertical solution word that is formed from a specific column.
 * Players win when they've guessed all letters in the solution word.
 */

// Raw input data in format: animalName,startPosition,hint
const crossword = `krebs,0,Schalentier  
elefant,-1,Größtes Landtier  
schlange,-4,Lautloser Jäger  
papagei,-2,Bunter Sprachkünstler  
pinguin,0,Flugunfähiger Schwimmer  
esel,-2,Sturer Vierbeiner  
piranha,-2,Gefährlicher Schwarmfisch  
seestern,-3,Meerestier mit fünf Armen  
schildkröte,-1,Langsamer Panzerträger  
hund,0,Treuer Begleiter  
seelöwe,-3,Verspielter Meeressäuger  
aal,-1,Schlängelnder Stromleiter  
antilope,-1,Schneller Sprinter der Savanne  
regenwurm,-2,Bodenlockerer mit Ringeln  
seegurke,-2,Tarnkünstler der Tiefsee`;

// The word that players need to completely reveal to win
const solution = 'klapperschlange';

// Arrays to store parsed data from the crossword input
const animals: string[] = []; // Names of animals in the crossword
const startPos: number[] = []; // Horizontal starting position of each animal name
const hints: string[] = []; // Hints for each animal

// Game state tracking
const guessedCharacters: string[] = []; // Letters that have been guessed correctly
let wrongGuesses: number = 0; // Counter for incorrect guesses

// Layout constants for the visual representation
const letterWidth = 35; // Width of each letter cell in pixels
const letterHeight = 35; // Height of each letter cell in pixels
const fontSize = 30; // Font size for letters in the crossword

/**
 * Initializes the game canvas and parses the crossword data.
 * This is a p5.js function that runs once at the start.
 */
function setup() {
  createCanvas(1000, 1000); // Create a 1000x1000 pixel canvas
  splitInput(); // Parse the crossword data
}

/**
 * Main drawing function that renders the game state.
 * This is a p5.js function that runs continuously.
 */
function draw() {
  background('white'); // Clear the canvas with a white background

  drawSolutionHightlight(); // Highlight the solution column
  drawCrossword(); // Draw the crossword grid and revealed letters
  drawResult(); // Display the game status (won or number of wrong guesses)
}

/**
 * Highlights the solution column with a yellow background.
 * This column contains the letters that form the solution word.
 */
function drawSolutionHightlight() {
  push(); // Save the current drawing state
  translate(4 * letterWidth, 0); // Move to the solution column (4th column)
  noStroke(); // No border
  fill('yellow'); // Yellow background
  rect(0, 0, letterWidth, letterHeight * animals.length); // Draw rectangle covering the entire column
  pop(); // Restore drawing state
}

/**
 * Draws the complete crossword grid with animal names and hints.
 * Only shows letters that have been correctly guessed.
 */
function drawCrossword() {
  push(); // Save the current drawing state
  textSize(fontSize); // Set text size for letters
  textAlign(CENTER, CENTER); // Center-align the text

  // Loop through each animal in the crossword
  for (let i = 0; i < animals.length; i++) {
    push(); // Save drawing state for this row
    translate(0, i * letterHeight); // Move to the current row

    // Loop through each letter of the current animal name
    for (let j = 0; j < animals[i].length; j++) {
      push(); // Save drawing state for this letter
      // Position the letter based on its startPos offset and its position in the word
      translate((4 + startPos[i] + j) * letterWidth, 0);

      // If this letter has been guessed, display it
      if (guessedCharacters.includes(animals[i][j])) {
        push();
        fill('black');
        text(animals[i][j], 0, 0, letterWidth, letterHeight);
        pop();
      }

      // Draw the cell border regardless of whether the letter is revealed
      push();
      noFill();
      stroke('black');
      strokeWeight(1);
      rect(0, 0, letterWidth, letterHeight);
      pop();

      pop(); // Restore drawing state for this letter
    }

    // Display the hint for this animal
    push();
    textSize(12); // Smaller text size for hints
    fill('black');
    textAlign(LEFT, CENTER);
    text(hints[i], 500, 0, 200, letterHeight);
    pop();

    pop(); // Restore drawing state for this row
  }

  pop(); // Restore original drawing state
}

/**
 * Displays the game status at the bottom of the crossword.
 * Shows either the number of wrong guesses or a victory message.
 */
function drawResult() {
  push(); // Save the current drawing state
  textSize(35); // Set text size for the result message
  translate(4 * letterWidth, letterHeight * (animals.length + 1)); // Position text below the crossword
  textAlign(LEFT, CENTER); // Align text
  if (hasWon()) {
    fill('green'); // Use green text for victory message
    text(`You won after ${wrongGuesses} wrong guesses`, 0, 0, 800, letterHeight);
  } else {
    fill('red'); // Use red text for ongoing game status
    text(`${wrongGuesses} wrong guesses`, 0, 0, 800, letterHeight);
  }
  pop(); // Restore the previous drawing state
}

/**
 * Handles keyboard input for guessing letters.
 * This is a p5.js function that runs whenever a key is pressed.
 * Updates game state based on whether the guess was correct.
 */
function keyPressed() {
  if (!hasWon()) {
    // Only accept input if the game is not won yet
    if (isValidGuess(key)) {
      guessedCharacters.push(key); // Add correct guess to the list of guessed characters
    } else {
      wrongGuesses++; // Increment wrong guess counter for incorrect guesses
    }
  }
}

/**
 * Checks if the guessed letter is valid (exists in any animal name)
 * and has not been guessed before.
 *
 * @param key The character that was typed
 * @returns true if the guess is valid, false otherwise
 */
function isValidGuess(key: string): boolean {
  for (let i = 0; i < animals.length; i++) {
    if (animals[i].includes(key) && !guessedCharacters.includes(key)) {
      return true; // Valid if the letter exists in any animal and hasn't been guessed
    }
  }
  return false; // Invalid if letter not found or already guessed
}

/**
 * Parses the raw crossword input string into the data structures.
 * Splits each line into animal name, starting position, and hint.
 */
function splitInput() {
  const words = crossword.split('\n'); // Split input by newlines to get each animal entry
  for (let i = 0; i < words.length; i++) {
    const parts = words[i].split(','); // Split each entry by comma to get individual parts
    animals.push(parts[0]); // First part is the animal name
    startPos.push(parseInt(parts[1])); // Second part is the starting position (converted to number)
    hints.push(parts[2]); // Third part is the hint
  }
}

/**
 * Checks if the player has won the game by revealing all letters in the solution word.
 *
 * @returns true if all letters in the solution have been guessed, false otherwise
 */
function hasWon(): boolean {
  for (const letter of solution) {
    if (!guessedCharacters.includes(letter)) {
      return false; // If any letter in solution is not guessed, game is not won
    }
  }
  return true; // All letters guessed, player has won
}
