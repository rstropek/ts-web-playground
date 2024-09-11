function setup() {
  createCanvas(400, 400);

  background("lightblue");

  // Draw the house
  fill("red");
  rect(150, 200, 100, 100); // Main body of the house

  fill("yellow");
  rect(185, 250, 30, 50); // Door of the house

  fill("darkred");
  triangle(140, 200, 260, 200, 200, 150); // Roof of the house

  // Draw the tree
  fill("brown");
  rect(280, 220, 20, 80); // Trunk of the tree

  fill("green");
  ellipse(290, 200, 60, 60); // Top leaves
  ellipse(270, 220, 60, 60); // Left leaves
  ellipse(310, 220, 60, 60); // Right leaves
}
