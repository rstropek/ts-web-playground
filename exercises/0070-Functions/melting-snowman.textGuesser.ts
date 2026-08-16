/** 
 * Get the initial value for currentWordStatus with underscores based on wordToGuess
 * 
 * @param wordToGuess Word to guess
 * 
 * @returns Initial value for currentWordStatus
 * 
 * This function must return a string with the same length as wordToGuess.
 * If a character in wordToGuess is a letter, the corresponding character
 * in the return value must be an underscore. If a character in wordToGuess
 * is a space, the corresponding character in the return value must be a space.
 */
function getInitialCurrentWord(wordToGuess: string): string {
    let currentWordStatus: string = "";
    for (let i = 0; i < wordToGuess.length; i++) {
        if (wordToGuess[i] !== " ") {
            currentWordStatus += "_";
        } else {
            currentWordStatus += " ";
        }
    }

    return currentWordStatus;
}

/**
 * Handles a guess from a user
 * 
 * @param key Key that the user guessed
 * @param wordToGuess Word to guess
 * @param currentWordStatus Current word status
 * 
 * @returns New value for currentWordStatus
 * 
 * This function must return a new value for currentWordStatus based on the
 * key that the user guessed. If the key is in wordToGuess, the corresponding
 * characters in currentWordStatus must be revealed.
 */
function guessKey(key: string, wordToGuess: string, currentWordStatus: string): string {
    const lowerKey: string = key.toLowerCase();

    let newCurrentWordStatus: string = "";
    for (let i = 0; i < wordToGuess.length; i++) {
        const lowerChar: string = wordToGuess[i].toLowerCase();
        if (lowerChar === lowerKey) {
            newCurrentWordStatus += wordToGuess[i];
        } else {
            newCurrentWordStatus += currentWordStatus[i];
        }
    }

    return newCurrentWordStatus;
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
 * * "n wrong guesses." otherwise ("n" is number of wrong guesses).
 */
function drawResult(win: boolean, wrongGuesses: number): void {
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
    let message: string = "Game Over";
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
