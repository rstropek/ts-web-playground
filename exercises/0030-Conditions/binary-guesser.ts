let guessedDigit1 = 0;
let guessedDigit2 = 0;
let guessedDigit3 = 0;
let guessedDigit4 = 0;
let num = 0;

function setup() {
  num = Math.floor(random(1, 16));

  createCanvas(400, 300);
  background("black");

  // Draw initial rectangles
  noFill();
  stroke("yellow");
  rect(50 + 0 * 75, 100, 50, 75);
  rect(50 + 1 * 75, 100, 50, 75);
  rect(50 + 2 * 75, 100, 50, 75);
  rect(50 + 3 * 75, 100, 50, 75);

  // Draw question
  textAlign(CENTER, CENTER);
  fill("yellow");
  noStroke();
  textSize(30);
  text(`${num} in binary?`, width / 2, height / 6);

  // Draw initial zeroes
  text(guessedDigit1, 75 + 0 * 75, 100 + 75 / 2);
  text(guessedDigit2, 75 + 1 * 75, 100 + 75 / 2);
  text(guessedDigit3, 75 + 2 * 75, 100 + 75 / 2);
  text(guessedDigit4, 75 + 3 * 75, 100 + 75 / 2);
}

function mouseClicked() {
  // Check if mouse is vertically over buttons
  if (mouseY >= 100 && mouseY <= 175) {
    // Process button clicks
    if (mouseX >= 50 + 0 * 75 && mouseX <= 50 + 0 * 75 + 50) {
      if (guessedDigit4 === 1) {
        guessedDigit4 = 0;
      } else {
        guessedDigit4 = 1;
      }
    }

    if (mouseX >= 50 + 1 * 75 && mouseX <= 50 + 1 * 75 + 50) {
      if (guessedDigit3 === 1) {
        guessedDigit3 = 0;
      } else {
        guessedDigit3 = 1;
      }
    }

    if (mouseX >= 50 + 2 * 75 && mouseX <= 50 + 2 * 75 + 50) {
      if (guessedDigit2 === 1) {
        guessedDigit2 = 0;
      } else {
        guessedDigit2 = 1;
      }
    }

    if (mouseX >= 50 + 3 * 75 && mouseX <= 50 + 3 * 75 + 50) {
      if (guessedDigit1 === 1) {
        guessedDigit1 = 0;
      } else {
        guessedDigit1 = 1;
      }
    }

    // Build new guessed number
    let guessedNumber = guessedDigit4 * Math.pow(2, 3);
    guessedNumber += guessedDigit3 * Math.pow(2, 2);
    guessedNumber += guessedDigit2 * Math.pow(2, 1);
    guessedNumber += guessedDigit1 * Math.pow(2, 0);

    // Default color is yellow
    let color = "yellow";
    if (guessedNumber === num) {
      // Use lime (light green) if answer is correct
      color = "lime";
    }
    fill("black");
    stroke(color);

    rect(50 + 0 * 75, 100, 50, 75);
    rect(50 + 1 * 75, 100, 50, 75);
    rect(50 + 2 * 75, 100, 50, 75);
    rect(50 + 3 * 75, 100, 50, 75);

    textAlign(CENTER, CENTER);
    fill(color);
    noStroke();
    textSize(30);
    text(guessedDigit4, 75 + 0 * 75, 100 + 75 / 2);
    text(guessedDigit3, 75 + 1 * 75, 100 + 75 / 2);
    text(guessedDigit2, 75 + 2 * 75, 100 + 75 / 2);
    text(guessedDigit1, 75 + 3 * 75, 100 + 75 / 2);

    if (guessedNumber === num) {
      text("Correct!", width / 2, 220);
    }
  }
}
