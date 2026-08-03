function setup() {
  createCanvas(400, 400);
  background("lightgray");

  // Draw the robot's head
  fill("gray");
  rect(100, 100, 200, 200);

  // Draw the robot's eyes
  fill("black");
  circle(150, 150, 40);
  circle(250, 150, 40);

  // Draw the robot's mouth
  fill("white");
  rect(150, 240, 100, 20);

  // Draw the robot's antenna
  line(200, 100, 200, 50);
  circle(200, 50, 20);
}
