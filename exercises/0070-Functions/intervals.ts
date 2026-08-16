let interval: number;

function setup(): void {
  createCanvas(300, 300);
  background("black");
  strokeWeight(2);
  stroke("lime");
  noFill();

  // setInterval calls a given function at a specified interval.
  //
  // +---------------------------------------- ID of the created interval (required to stop it)
  // |       +-------------------------------- Function name
  // |       |           +-------------------- Function to call regularly
  // |       |           |           +-------- Interval in milliseconds
  // v       v           v           v
  interval = setInterval(drawCircle, 1000);
}

function mouseClicked(): void {
  // _clearInterval_ stops a previously created interval.
  // Note that the interval ID is required to stop it. We got
  // this ID when we created the interval with setInterval.
  clearInterval(interval);
  console.log("Interval cleared");
}

/**
 * Helper function drawing a circle at a random position with a random diameter.
 */
function drawCircle(): void {
  const centerX: number = random(width);
  const centerY: number = random(height);
  const diameter: number = random(20, 80);
  circle(centerX, centerY, diameter);
}
