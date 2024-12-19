// Arrays to store properties of multiple circles
const circlesCenterX: number[] = [];    // X coordinates of circles
const circlesCenterY: number[] = [];    // Y coordinates of circles
const circlesDiameter: number[] = [];   // Diameter of each circle
const circlesFill: string[] = [];       // Fill color of each circle
let nextCircle = 0;                     // Timestamp for when to create next circle
const maxDiameter = 150;                // Maximum diameter for any circle

// Array of colors to randomly choose from
const availableColors = [
  "pink",
  "yellow",
  "aqua",
  "lime",
  "red",
  "gold",
]

// setup runs once at the start
function setup() {
  createCanvas(400, 400);
}

// draw runs continuously in a loop
function draw() {
  background("black");

  // Check if it's time to create a new circle
  // NEW: Use millis() to get the number of milliseconds since the program started
  if (millis() >= nextCircle) {
    // Generate random properties for new circle
    const d = random(10, maxDiameter);  // Random diameter between 10 and maxDiameter

    // NOTE: Use push() to add new elements to the END of an array
    // Store the diameter
    circlesDiameter.push(d);            

    // Store random X and Y positions, keeping circle within canvas
    circlesCenterX.push(random(d / 2, width - d / 2));
    circlesCenterY.push(random(d / 2, height - d / 2));

    // Random color from available colors
    // NEW: With _random(myArray)_, you can pick a random element of an array.
    //      Here, we are picking a random color.
    circlesFill.push(random(availableColors));

    // Set next circle creation time to between 0.5 and 2 seconds from now
    nextCircle = millis() + random(500, 2000);
  }

  // Draw all circles stored in the arrays
  noStroke();
  for (let i = 0; i < circlesDiameter.length; i++) {
    fill(circlesFill[i]);              // Set the fill color for current circle
    circle(circlesCenterX[i], circlesCenterY[i], circlesDiameter[i]); // Draw the circle
  }
}
