function setup(): void {
  createCanvas(300, 300);
  background("black");
  strokeWeight(2);
  stroke("lime");
  noFill();
}

function mouseClicked(): void {
  const centerX: number = getRandomInt(0, width);
  const centerY: number = getRandomInt(0, height);
  const diameter: number = getRandomInt(10, 50);
  circle(centerX, centerY, diameter);
}

/**
 * Helper function to get an integer random number between min and max
 * @param min Minimum value (inclusive)
 * @param max Maximum value (exclusive)
 * @returns Random integer between min and max
 */
function getRandomInt(min: number, max: number): number {
  return floor(random(min, max));
}
