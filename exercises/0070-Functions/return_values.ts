function setup() {
    createCanvas(300, 300);
    background("black");
    strokeWeight(2);
    stroke("lime");
    noFill();
  }
  
  function mouseClicked() {
    const center_x = getRandomInt(0, width);
    const center_y = getRandomInt(0, height);
    const diameter = getRandomInt(10, 50);
    circle(center_x, center_y, diameter);
  }
  
  /**
   * Helper function to get an integer random number between min and max
   * @param min Minimum value (inclusive)
   * @param max Maximum value (exclusive)
   * @returns Random integer between min and max
   */
  function getRandomInt(min: number, max: number): number {
    return Math.floor(random(min, max));
  }