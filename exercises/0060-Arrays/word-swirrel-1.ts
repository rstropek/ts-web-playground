const WIDTH = 500;
const HEIGHT = 300;
const MARGIN = 50;

const wordToGuess = "apple";

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background("black");
  textAlign(CENTER, CENTER);
  colorMode(HSB);
  angleMode(DEGREES);

  for (let i = 0; i < wordToGuess.length; i++) {
    // Get random position, font size, text color, and angle
    const x = random(MARGIN, WIDTH - MARGIN);
    const y = random(MARGIN, HEIGHT - MARGIN);
    const charSize = random(50, 150);
    const textColor = random(0, 360);
    const angle = random(-90, 90);

    push();
    translate(x, y);
    // This is NEW! We can easily rotate text.
    // NOTE: _rotate_ rotates around the origin (0, 0). Therefore it is important
    //       that you _translate_ to the position you want to draw the text at.
    //       We covered _translate_ in previous examples.
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
