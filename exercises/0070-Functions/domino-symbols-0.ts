function setup() {
  createCanvas(200, 200);
  background("lightgray");

  const diceSize = 200; // size of the square (width and height)

  const symbol = floor(random(1, 7));

  // draw black background
  fill("black");
  noStroke();
  rect(0, 0, diceSize, diceSize);

  const centerX = diceSize / 2;
  const centerY = diceSize / 2;
  const size = 80;

  // draw symbol
  switch (symbol) {
    case 1:
      // Square
      fill("white");
      stroke("white");
      strokeWeight(2);
      rectMode(CENTER);
      rect(centerX, centerY, size, size);
      rectMode(CORNER);
      break;
    case 2:
      // Circle
      fill("white");
      noStroke();
      circle(centerX, centerY, size);
      break;
    case 3:
      // Triangle
      fill("white");
      stroke("white");
      strokeWeight(2);
      triangle(
        centerX, centerY - size / 2,
        centerX - size / 2, centerY + size / 2,
        centerX + size / 2, centerY + size / 2
      );
      break;
    case 4:
      // Star emoji ⭐
      textAlign(CENTER, CENTER);
      textSize(size);
      text("⭐", centerX, centerY);
      break;
    case 5:
      // Heart emoji ❤️
      textAlign(CENTER, CENTER);
      textSize(size);
      text("❤️", centerX, centerY);
      break;
    case 6:
      // Lucky charm emoji 🍀
      textAlign(CENTER, CENTER);
      textSize(size);
      text("🍀", centerX, centerY);
      break;
  }
}
