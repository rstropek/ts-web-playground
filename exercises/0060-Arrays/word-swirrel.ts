const WIDTH = 500;
const HEIGHT = 300;

// Enter the word to guess here.
//                   vvv
//                   vvv
const wordToGuess = "apple";

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background("black");

  // Lets copy the word to guess. wordToScramble will contain the remaining
  // characters during the scrambling process.
  let wordToScramble = wordToGuess;

  // scrambledWord receives the letters of the word to scramble.
  let scrambledWord = "";

  // Repeat until all letters will have been used.
  while (wordToScramble.length > 0) {
    // Get a random position in wordToScramble
    let letterIndex = Math.floor(random(wordToScramble.length));

    // Add the random letter to scrambledWord
    scrambledWord += wordToScramble[letterIndex];

    // ATTENTION: Here you see the new function "substring". As the name suggest,
    // it returns a sub-string of the original string. In this case, we take
    // all letters BEFORE letterIndex and all letter AFTER the letterIndex, but
    // not the letter at the position letterIndex.
    // Example: Assume, wordToScramble is aple (apple, but one p has already been removed).
    //          Also assume that letterIndex is 2 ("l").
    //          substring(0, 2) = "ap"
    //          substring(3) = "e"
    //
    //                                        +---------------- Start
    //                                        |  +------------- End (excluding)
    //                                        V  V
    wordToScramble = wordToScramble.substring(0, letterIndex)
    //                           +----------------------------- Start
    //                           V                   (No end means "take until end")
      + wordToScramble.substring(letterIndex + 1);
  }

  textAlign(CENTER, CENTER);
  fill("white");
  textSize(75);
  text(scrambledWord, WIDTH / 2, HEIGHT / 2);
}

// This method will be called automatically when the user clicks "Guess".
// The guessed text will be in "textInput".
function guess(textInput: string) {
  fill("white");

  if (textInput === wordToGuess) {
    background("green");
    textSize(75);
    text("Correct!", WIDTH / 2, HEIGHT / 2);
  } else {
    background("red");
    textSize(50);
    text(`Wrong!\nIt was "${wordToGuess}"`, WIDTH / 2, HEIGHT / 2);
  }
}
