let interval: number;

function setup() {
  createCanvas(300, 300);
  background("black");
  strokeWeight(2);
  stroke("lime");
  noFill();

  // setInterval calls a given function at a specified interval.
  //
  // +---------------------------------------- ID of the created inverval (required to stop it)
  // |       +-------------------------------- Function name
  // |       |           +-------------------- Function to call regularly
  // |       |           |           +-------- Interval in milliseconds
  // v       v           v           v
  interval = setInterval(drawCircle, 1000);
}

function mouseClicked() {
  // _clearInterval_ stops a previously created interval.
  // Note that the interval ID is required to stop it. We got
  // this ID when we created the interval with setInterval.
  clearInterval(interval);
  console.log("Interval cleared");
}

/**
 * Helper function drawing a circle at a random position with a random diameter.
 */
function drawCircle() {
  const center_x = random(width);
  const center_y = random(height);
  const diameter = random(20, 80);
  circle(center_x, center_y, diameter);
}