/*
This example is already responsive. Students have to draw the robot
first with absolute coordinates. After learning about variables,
we are going to make it responsive.
*/

function setup() {
  createCanvas(300, 300);
  background("lightgray");

  // Define relative sizes and positions based on canvas width and height
  const headWidth = width * 0.50; // Head size as 75% of the canvas width
  const headX = width / 2 - headWidth / 2; // Center the head horizontally
  const headY = height / 2 - headWidth / 2; // Center the head vertically

  // Draw the robot's head
  fill("gray");
  rect(headX, headY, headWidth, headWidth);

  // Draw the robot's eyes
  const eyeSize = headWidth * 0.2; // Eye size as 20% of the head size
  const eyeOffsetX = headWidth * 0.15; // Horizontal offset for eyes
  const eyeY = headY + headWidth * 0.3; // Y position for eyes

  fill("black");
  circle(headX + eyeOffsetX, eyeY, eyeSize);
  circle(headX + headWidth - eyeOffsetX, eyeY, eyeSize);

  // Draw the robot's mouth
  const mouthWidth = headWidth * 0.5; // Mouth width as 50% of the head size
  const mouthHeight = headWidth * 0.1; // Mouth height as 10% of the head size
  const mouthX = headX + (headWidth - mouthWidth) / 2; // Center the mouth horizontally
  const mouthY = headY + headWidth * 0.6; // Y position for the mouth

  fill("white");
  rect(mouthX, mouthY, mouthWidth, mouthHeight);

  // Draw antenna on top of the head
  const antennaX = headX + headWidth / 2; // Center the antenna horizontally
  const antennaY1 = headY; // Start of the antenna at the top of the head
  const antennaY2 = headY - headWidth * 0.3; // End of the antenna

  line(antennaX, antennaY1, antennaX, antennaY2);
  circle(antennaX, antennaY2, eyeSize * 0.5);
}
