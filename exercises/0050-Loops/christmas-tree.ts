const TOP_MARGIN = 80;
const SPHERE_DIAMETER = 30;
const INITIAL_TRIANGLE_BASE_WIDTH = 100;
const NUMBER_OF_LAYERS = 4;

function setup() {

// Rules for drawing the tree:
// ===========================
//
// 1. The tree must be centered horizontally and symmetrical in shape.
// 2. The tip (topmost point) of the tree is positioned at the 
//    y-coordinate defined by TOP_MARGIN.
// 3. The base width of the topmost triangle is set by INITIAL_TRIANGLE_BASE_WIDTH.
// 4. The height of each triangle is calculated as 50% of its base width.
// 5. After each triangle is drawn, the origin of the drawing 
//    must shift downward by the triangle's height.
// 6. For each subsequent layer, both the base width and height 
//    of the triangle increase by 50%.
// 7. Draw a Christmas tree ball with a random color on the left- 
//    and rightmost edge of each layer.

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
        push();
        fill(Math.floor(random(0, 255)), Math.floor(random(0, 255)), Math.floor(random(0, 255)));
        circle(-triangleBaseWidth / 2, SPHERE_DIAMETER / 2, SPHERE_DIAMETER);
        circle(triangleBaseWidth / 2, SPHERE_DIAMETER / 2, SPHERE_DIAMETER);
        pop();
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
