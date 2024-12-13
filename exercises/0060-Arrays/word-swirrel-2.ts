//           +------------- Syntax for datatype "array of strings"
//           |          +-- Elements of array are enclosed with []
//           V          V
const WORDS: string[] = [
    "apple",
    "banana",
    "cherry",
    "orange",
    "grapes",
    "lemon",
    "melon",
    "peach",
    "plum",
    "berry",
    "water",
    "cloud",
    "bread",
    "cheese",
    "pizza",
    "table",
    "chair",
    "house",
    "grass",
    "flower"
  ];
  
  const WIDTH = 500;
  const HEIGHT = 500;
  const MARGIN = 75;
  
  let wordToGuess: string;
  
  function setup() {
    createCanvas(WIDTH, HEIGHT);
    background("black");
    textAlign(CENTER, CENTER);
    colorMode(HSB);
    angleMode(DEGREES);
  
    // Use random() to get a random word from the WORDS array.
    // Every time you run the program, a different word will be selected.
    wordToGuess = random(WORDS);
  
    for(let i = 0; i < wordToGuess.length; i++) {
      const x = random(MARGIN, WIDTH - MARGIN);
      const y = random(MARGIN, HEIGHT - MARGIN);
      const charSize = random(50, 200);
      const textColor = random(0, 360);
      const angle = random (-90, 90);
  
      push();
      translate(x, y);
      rotate(angle);
      fill(textColor, 100, 100);
      textSize(charSize);
      text(wordToGuess[i], 0, 0);
      pop();
    }
  }
  
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
