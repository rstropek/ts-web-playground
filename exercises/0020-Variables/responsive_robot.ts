function setup() {
  createCanvas(400, 400);
  background("lightgray");

  // Define relative sizes and positions based on canvas width and height
  const headWidth: number = width * 0.50; // Head size as 50% of the canvas width
  const headHeight: number = height * 0.50; // Head size as 50% of the canvas height
  const headX: number = width / 2 - headWidth / 2; // Center the head horizontally
  const headY: number = height / 2 - headHeight / 2; // Center the head vertically

  // Draw the robot's head
  fill("gray");
  rect(headX, headY, headWidth, headHeight);

  // Draw the robot's eyes
  const eyeSize: number = min(headWidth, headHeight) * 0.2;
  const eyeOffsetX: number = headWidth * 0.25;
  const eyeY: number = headY + headHeight * 0.25;

  fill("black");
  circle(headX + eyeOffsetX, eyeY, eyeSize);
  circle(headX + headWidth - eyeOffsetX, eyeY, eyeSize);

  // Draw the robot's mouth
  const mouthWidth: number = headWidth * 0.5;
  const mouthHeight: number = headHeight * 0.1;
  const mouthX: number = headX + (headWidth - mouthWidth) / 2;
  const mouthY: number = headY + headHeight * 0.70;

  fill("white");
  rect(mouthX, mouthY, mouthWidth, mouthHeight);

  // Draw the robot's antenna
  const antennaX: number = headX + headWidth / 2;
  const antennaStartY: number = headY;
  const antennaEndY: number = headY - headHeight * 0.25;

  line(antennaX, antennaStartY, antennaX, antennaEndY);
  circle(antennaX, antennaEndY, eyeSize * 0.5);
}
