const SIZE = 400;  // Canvas size (square)
const MARGIN = 25; // Margin between the edges and the rays.
                   // This is also the distance between the rays.

// The current hue value of the rays
let rayColor = 0;

function setup() {
  createCanvas(SIZE, SIZE);
  background("black");
  colorMode(HSB);
}

function draw() {
  background("black");
  strokeWeight(2);

  // <<< Add your code here
  let i = MARGIN;
  while (i <= SIZE - MARGIN) {
    stroke(rayColor, 100, 100);
    line(MARGIN, i, mouseX, mouseY);
    line(width - MARGIN, i, mouseX, mouseY);

    line(i, MARGIN, mouseX, mouseY);
    line(i, height - MARGIN, mouseX, mouseY);

    i += MARGIN;
    rayColor = (rayColor + 0.25) % 360;
  }
}