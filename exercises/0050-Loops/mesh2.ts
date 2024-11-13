const SIZE = 400;  // Canvas size (square)
const MARGIN = 50; // Margin between the edges and the rays.
                   // This is also the distance between the rays.

function setup() {
  createCanvas(SIZE, SIZE);
  background("black");

  strokeWeight(1);
  stroke("lime");

  let left = MARGIN;
  while (left <= SIZE - MARGIN) {
    let right = MARGIN;
    while (right <= SIZE - MARGIN) {
      line(MARGIN, left, width - MARGIN, right);
      right += MARGIN;
    }

    left += MARGIN;
  }
}

