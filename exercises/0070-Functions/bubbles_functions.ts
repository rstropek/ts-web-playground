const circlesX: number[] = [];
const circlesY: number[] = [];
const circlesDiameter: number[] = [];

let waitingTime: number = 3000;
let circleInterval: number;
let levelInterval: number;

let points: number = 0;

function setup(): void {
  createCanvas(300, 300);

  // Add the first circle.
  addRandomCircle();

  // Start an interval for adding circles.
  circleInterval = setInterval(addRandomCircle, waitingTime);

  // Start an interval for increasing the difficulty.
  levelInterval = setInterval(nextLevel, 10000);
}

function draw(): void {
  background("black");

  // If more than 10 circles are on the screen, stop the game.
  if (circlesX.length >= 10) { 
    stopGame();

    // Note that the return statement stops the execution of the function.
    return;
  }

  strokeWeight(2);
  stroke("lime");
  fill("black");
  
  // Draw all circles
  for (let i = 0; i < circlesX.length; i++) {
    circle(circlesX[i], circlesY[i], circlesDiameter[i]);
  }

  // Draw the points
  noStroke();
  fill("yellow");
  textSize(20);
  text(`Points: ${points}`, 10, 30);
}

/**
 * Helper method that is called when the game is over.
 */
function stopGame(): void {
  // Stop all intervals
  clearInterval(circleInterval);
  clearInterval(levelInterval);

  // Display the game over message.
  background("black");
  textSize(30);
  fill("red");
  textAlign(CENTER, CENTER);
  text(`Game Over\nPoints: ${points}`, 0, 0, width, height);

  // ⚠️ This is a new trick! ⚠️
  // You can call noLoop() to stop the draw function from being called.
  // If you want to resume the draw function, you can call loop().
  noLoop();
}

/**
 * Helper method that is called when the player advances to the next level.
 */
function nextLevel(): void {
  // Remove the current interval and start a new one with half the waiting time.
  clearInterval(circleInterval);
  waitingTime /= 2;
  circleInterval = setInterval(addRandomCircle, waitingTime);
}

/**
 * Helper method that adds a random circle to the screen.
 */
function addRandomCircle(): void {
  circlesX.push(random(width));
  circlesY.push(random(height));
  circlesDiameter.push(random(10, 50));
}

function mouseClicked(): void {
  // Check if the mouse is inside any circle.
  // NOTE: We loop BACKWARDS because we remove elements from the arrays
  // while looping. Looping forwards would skip elements after a removal.
  for (let i = circlesX.length - 1; i >= 0; i--) {
    if (isInside(mouseX, mouseY, i)) {
      // If the mouse is inside the circle, remove it.
      circlesX.splice(i, 1);
      circlesY.splice(i, 1);
      circlesDiameter.splice(i, 1);
      points++;
    }
  }
}

/**
 * Helper method that checks if a point is inside a circle.
 * @param x The x-coordinate of the point.
 * @param y The y-coordinate of the point.
 * @param circleIndex The index of the circle in the circles array.
 * @returns True if the point is inside the circle, false otherwise.
 */
function isInside(x: number, y: number, circleIndex: number): boolean {
  // Calculate the distance between the point and the center of the circle.
  // Note: p5js has a built-in function _dist_ that does this. However,
  // we want to practice pythagorean theorem, so we will calculate it manually.
  const dx: number = x - circlesX[circleIndex];
  const dy: number = y - circlesY[circleIndex];
  const distance: number = sqrt(dx * dx + dy * dy);
  return distance < circlesDiameter[circleIndex] / 2;
}
