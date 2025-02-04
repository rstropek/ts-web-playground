const circles_x: number[] = [];
const circles_y: number[] = [];
const circles_diameter: number[] = [];

let waiting_time = 3000;
let circle_interval: number;
let level_interval: number;

let points = 0;

function setup() {
  createCanvas(300, 300);

  // Add the first circle.
  addRandomCircle();

  // Start an interval for adding circles.
  circle_interval = setInterval(addRandomCircle, waiting_time);

  // Start an interval for increasing the difficulty.
  level_interval = setInterval(nextLevel, 10000);
}

function draw() {
  background("black");

  // If more than 10 circles are on the screen, stop the game.
  if (circles_x.length >= 10) { 
    stopGame();

    // Note that the return statement stops the execution of the function.
    return;
  }

  strokeWeight(2);
  stroke("lime");
  fill("black");
  
  // Draw all circles
  for (let i = 0; i < circles_x.length; i++) {
    circle(circles_x[i], circles_y[i], circles_diameter[i]);
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
function stopGame() {
  // Stop all intervals
  clearInterval(circle_interval);
  clearInterval(level_interval);

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
function nextLevel() {
  // Remove the current interval and start a new one with half the waiting time.
  clearInterval(circle_interval);
  waiting_time /= 2;
  circle_interval = setInterval(addRandomCircle, waiting_time);
}

/**
 * Helper method that adds a random circle to the screen.
 */
function addRandomCircle() {
  circles_x.push(random(width));
  circles_y.push(random(height));
  circles_diameter.push(random(10, 50));
}

function mouseClicked() {
  // Check if the mouse is inside any circle.
  for (let i = 0; i < circles_x.length; i++) {
    if (isInside(mouseX, mouseY, i)) {
      // If the mouse is inside the circle, remove it.
      circles_x.splice(i, 1);
      circles_y.splice(i, 1);
      circles_diameter.splice(i, 1);
      points++;
    }
  }
}

/**
 * Helper method that checks if a point is inside a circle.
 * @param x The x-coordinate of the point.
 * @param y The y-coordinate of the point.
 * @param circle_index The index of the circle in the circles array.
 * @returns True if the point is inside the circle, false otherwise.
 */
function isInside(x: number, y: number, circle_index: number): boolean {
  // Calculate the distance between the point and the center of the circle.
  // Note: p5js has a built-in function _dist_ that does this. However,
  // we want to practice pythagorean theorem, so we will calculate it manually.
  const dx = x - circles_x[circle_index];
  const dy = y - circles_y[circle_index];
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circles_diameter[circle_index] / 2;
}