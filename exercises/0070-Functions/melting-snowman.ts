const MAX_WRONG_GUESSES = 10;

/** Word to guess */
const wordToGuess = "Winterwald";

/** 
 * Current word status
 * 
 * At the beginning, this variable contains an underscore ("_")
 * for each character wordToGuess (e.g. "\_\_\_" if word to guess 
 * is "ice"). If the user guesses a letter correctly, the 
 * corresponding letter(s) are revealed in this variable 
 * (e.g. "i\_\_" after guessing "i" in "ice").
 */
let currentWordStatus: string;

/**
 * Last guess
 * 
 * This character contains the lastly revealed character(s).
 * If the character at a given index has not be revealed, it contains
 * a space at the position.
 * 
 * Example if wordToGuess is "ice":
 * * At the beginning, this variable contains three spaces.
 * * If the user guesses "i", it contains "i  " ("i" with two spaces).
 * * If the user guesses "c", it contains space, "c", and space.
 */
let lastGuess: string;

/** Font for text output */
let font: any;

/** Number of wrong guesses */
let wrongGuesses = 0;

/**
 * Value indicating whether the program still accepts keys
 *
 * Becomes false if the game is over. 
 */
let acceptKeys = true;

/** Initially fills currentWordStatus with underscores based on wordToGuess */
function fillCurrentWord() {
    currentWordStatus = "";
    for (let i = 0; i < wordToGuess.length; i++) {
        if (wordToGuess[i] != " ") {
            currentWordStatus += "_";
        } else {
            currentWordStatus += " ";
        }
    }
}

/**
 * Handles a guess from a user
 * 
 * @param key Key that the user guessed
 * 
 * This method must maintain the following global variables:
 * 
 * * currentWordStatus
 * * lastGuess
 */
function guessKey(key: string) {
    const lowerKey = key.toLowerCase();

    lastGuess = "";
    let found = false;
    let newCurrentWordStatus = "";
    for (let i = 0; i < wordToGuess.length; i++) {
        const lowerChar = wordToGuess[i].toLowerCase();
        if (lowerChar === lowerKey) {
            newCurrentWordStatus += wordToGuess[i];
            lastGuess += wordToGuess[i];
            found = true;
        } else {
            newCurrentWordStatus += currentWordStatus[i];
            lastGuess += " ";
        }
    }

    currentWordStatus = newCurrentWordStatus;
    if (!found) {
        wrongGuesses++;
    }
}

function preload() {
    // Load the font from the web
    font = loadFont("https://cddataexchange.blob.core.windows.net/images/SyneMono-Regular.ttf");
}

function setup() {
    // Initially fill the currentWordStatus
    fillCurrentWord();

    createCanvas(800, 500);
    angleMode(DEGREES);

    // Draw the screen one time
    redraw();
    noLoop(); // Stop calling draw() automatically
}

function draw() {
    background("white");

    if (currentWordStatus === wordToGuess) {
        // User has guessed the word correctly
        acceptKeys = false;
        drawResult(true);
    } else if (wrongGuesses === MAX_WRONG_GUESSES) {
        // User has reached 10 wrong guesses -> game over
        acceptKeys = false;
        drawResult(false);
    } else {
        // Game still running -> draw snowman
        drawSnowman(wrongGuesses);
        drawCurrentWordStatus(font, currentWordStatus, lastGuess);
    }

}

function keyPressed() {
    // If game is over, do not accept keys
    if (!acceptKeys) { return; }

    // Handle guess
    guessKey(key);

    // Refresh the screen one time
    redraw();
}

/**
 * Draws the result text
 * 
 * @param win False if the user has reached 10 wrong guesses, otherwise true
 * 
 * Draws the result text on the screen. If the user has lost (10 wrong guesses),
 * the text must be "Game Over" in red.
 * 
 * If the user has guessed the word correctly, the text must be:
 * 
 * * "No wrong guesses!" if number of wrong guesses is zero.
 * * "One wrong guess!" if number of wrong guesses is one.
 * * "n wrong guesses" otherwise ("n" is number of wrong guesses).
 */
function drawResult(win: boolean) {
    push();
    textAlign(CENTER, CENTER);
    if (win) {
        fill("green");
    } else {
        fill("red");
    }
    noStroke();
    textSize(65);
    textFont(font);
    let message = "Game Over";
    if (win) {
        switch (wrongGuesses) {
            case 0:
                message = "No wrong guesses!";
                break;
            case 1:
                message = "One wrong guess!";
                break;
            default:
                message = `${wrongGuesses} wrong guesses.`;
                break;
        }
    }
    text(message, width / 2, height / 2);
    pop();
}

/**
 * Draw the snowman
 * 
 * Leave out some parts of the snowman depending on the number of
 * wrong guesses:
 * 
 * * 1 wrong: Lower three buttons
 * * 2 wrong: Upper three buttons
 * * 3 wrong: Left half of mouth
 * * 4 wrong: Nose
 * * 5 wrong: Right half of mouth
 * * 6 wrong: Left eye
 * * 7 wrong: Right eye
 * * 8 wrong: Hat
 * * 9 wrong: Top body part
 * * 10 wrong: GAME OVER
 */
function drawSnowman(numberOfWrongGuesses: number) {
    // Set center of X axis
    translate(130, 0);

    // Body
    push();
    stroke("black");
    strokeWeight(2);
    fill("aliceblue")
    if (numberOfWrongGuesses < 10) {
        circle(0, 350, 250);
    }
    if (numberOfWrongGuesses < 9) {
        circle(0, 175, 150);
    }
    pop();

    // Eyes
    push();
    noStroke();
    fill("black");
    if (numberOfWrongGuesses < 6) {
        circle(-25, 150, 25);
    }
    if (numberOfWrongGuesses < 7) {
        circle(25, 150, 25);
    }
    pop();

    // Nose
    if (numberOfWrongGuesses < 4) {
        push();
        noStroke();
        fill("orange");
        triangle(0, 195, 0, 165, 40, 180);
        pop();
    }

    // Mouth
    push();
    fill("black");
    translate(0, 180);
    rotate(45);
    let start = 0;
    if (numberOfWrongGuesses >= 5) {
        start = 6;
    } else if (numberOfWrongGuesses >= 3) {
        start = 3;
    }
    for (let i = start; i < 6; i++) {
        circle(40, 0, 12);
        rotate(18);
    }
    pop();

    // Knobs
    push();
    start = 0;
    if (numberOfWrongGuesses >= 2) {
        start = 6;
    } else if (numberOfWrongGuesses >= 1) {
        start = 3;
    }
    for (let i = start; i < 6; i++) {
        noStroke();
        fill("black");
        circle(0, 275, 15);
        translate(0, 25);
    }
    pop();

    // Hat
    if (numberOfWrongGuesses < 8) {
        push();
        noStroke();
        fill("black");
        rect(-85, 110, 170, 10);
        rect(-50, 50, 100, 60);
        pop();
    }
}

function drawCurrentWordStatus(font: any, currentWordStatus: string, lastGuess: string) {
    push();
    textAlign(LEFT, BOTTOM);
    translate(225, 0);

    // Draw current word status
    fill("dodgerblue");
    noStroke();
    textSize(45);
    textFont(font);
    text(currentWordStatus, 0, 250);

    // Draw last guess in different color
    fill("darkblue");
    text(lastGuess, 0, 250);
    pop();
}