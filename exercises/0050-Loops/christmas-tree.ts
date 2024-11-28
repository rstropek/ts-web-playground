const TOP_MARGIN = 80;
const SPHERE_DIAMETER = 30;
const INITIAL_TRIANGLE_BASE_WIDTH = 100;
const NUMBER_OF_LAYERS = 4;

function setup() {
  createCanvas(500, 500);
  background("black");
  fill("green");
  noStroke();

  for (let pass = 0; pass < 2; pass++) {
    let triangleBaseWidth = INITIAL_TRIANGLE_BASE_WIDTH;
    let triangleHeight = triangleBaseWidth / 2;

    resetMatrix();
    translate(width / 2, TOP_MARGIN + triangleHeight);

    for (let i = 0; i < NUMBER_OF_LAYERS; i++) {
      if (pass === 0) {
        triangle(-triangleBaseWidth / 2, 0, 0, -triangleHeight, triangleBaseWidth / 2, 0);
      } else {
        fill(Math.floor(random(0, 255)), Math.floor(random(0, 255)), Math.floor(random(0, 255)));
        circle(-triangleBaseWidth / 2, SPHERE_DIAMETER / 2, SPHERE_DIAMETER);
        circle(triangleBaseWidth / 2, SPHERE_DIAMETER / 2, SPHERE_DIAMETER);
      }

      if (i < NUMBER_OF_LAYERS - 1) {
        translate(0, triangleHeight);
        triangleBaseWidth *= 1.5;
        triangleHeight = triangleBaseWidth / 2;
      }
    }
  }

  fill("brown");
  rect(-25, 0, 50, 50);
}
