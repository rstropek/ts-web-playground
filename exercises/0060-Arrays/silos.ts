// Set the initial fill levels for the silos. The fill levels are separated by commas.
const INITIAL_FILL = "3,7,8,3,10,2";

const SILO_MAX = 10; // Maximum fill for each silo
const CRITICAL_FILL = 8; // Critical fill level for each silo

// Store the fill values for the silos. Will be a value between 0 and SILO_MAX.
const silos: number[] = [];

// Constants for the layout
const CANVAS_HEIGHT = 500;
const CANVAS_WIDTH = 480;

const SILO_WIDTH = 50; // Width of each silo
const SILO_GAP = 25; // Gap between silos
const SILO_HEIGHT = 320; // Height of each silo
const SILOS_TOP = CANVAS_HEIGHT / 2 - SILO_HEIGHT / 2; // Y-coordinate of the top of the silos

const BUTTON_SIZE = 20; // Size of the buttons ("add" and "remove")
const BUTTON_GAP = 15; // Gap between the bottom of the buttons and the top of the silos
const BUTTON_TOP = SILOS_TOP - BUTTON_GAP - BUTTON_SIZE; // Y-coordinate of the top of the buttons

// Arrays to store the x-coordinates of each silo
const silosX: number[] = [];

// Arrays to store the x-coordinates of the "add" and "remove" buttons
const upX: number[] = [];
const downX: number[] = [];

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Parse the fill string and store the values in the "silos" array
  let num = 0;
  for (let i = 0; i < INITIAL_FILL.length; i++) {
    if (INITIAL_FILL[i] === ",") {
      silos.push(num);
      num = 0;
    } else {
      num = num * 10 + parseInt(INITIAL_FILL[i]);
    }
  }

  silos.push(num);

  // Calculate the x-coordinates of the silos and the buttons
  for (let i = 0; i < silos.length; i++) {
    const x = SILO_GAP + i * (SILO_WIDTH + SILO_GAP);
    silosX.push(x);
    upX.push(x);
    downX.push(x + SILO_WIDTH - BUTTON_SIZE);
  }
}

function draw() {
  background("black");

  for (let i = 0; i < silos.length; i++) {
    const indicatorSize = (BUTTON_SIZE / 2) * 0.6;

    // "add" button
    push();
    noStroke();
    fill("yellow");
    translate(upX[i], BUTTON_TOP); // Use translate to simplify the drawing code
    rect(0, 0, BUTTON_SIZE, BUTTON_SIZE);

    // Hover effect: change color of the triangle when the mouse is over the button
    if (
      mouseX >= upX[i] &&
      mouseX <= upX[i] + BUTTON_SIZE &&
      mouseY >= BUTTON_TOP &&
      mouseY <= BUTTON_TOP + BUTTON_SIZE
    ) {
      fill("red");
    } else {
      fill("black");
    }
    translate(BUTTON_SIZE / 2, BUTTON_SIZE / 2);
    // Use a triangle to draw the "add" indicator. The "add" indicator points towards the silo
    // representing the direction of the flow (i.e. "add" more to the silo).
    triangle(
      -indicatorSize,
      -indicatorSize,
      indicatorSize,
      -indicatorSize,
      0,
      indicatorSize
    );
    pop();

    // "remove" button (works analogously to the "add" button)
    push();
    noStroke();
    fill("yellow");
    translate(downX[i], BUTTON_TOP);
    rect(0, 0, BUTTON_SIZE, BUTTON_SIZE);

    if (
      mouseX >= downX[i] &&
      mouseX <= downX[i] + BUTTON_SIZE &&
      mouseY >= BUTTON_TOP &&
      mouseY <= BUTTON_TOP + BUTTON_SIZE
    ) {
      fill("red");
    } else {
      fill("black");
    }
    translate(BUTTON_SIZE / 2, BUTTON_SIZE / 2);
    triangle(
      -indicatorSize,
      indicatorSize,
      indicatorSize,
      indicatorSize,
      0,
      -indicatorSize
    );
    pop();

    // Draw the silo
    push();
    // Change the color of the silo based on the fill level
    if (silos[i] >= CRITICAL_FILL) {
      fill("red");
    } else {
      fill("lime");
    }

    // Calculate the height of the fill bar: silos[i] / SILO_MAX is the
    // filled fraction, times the silo height in pixels.
    let fillHeight = (silos[i] / SILO_MAX) * SILO_HEIGHT;
    if (fillHeight > SILO_HEIGHT) {
      // If the fill level exceeds the maximum, set it to the maximum height
      fillHeight = SILO_HEIGHT;
    }

    translate(silosX[i], SILOS_TOP); // Use translate again to simplify the drawing code
    rect(0, SILO_HEIGHT - fillHeight, SILO_WIDTH, fillHeight); // Silo fill

    // Draw the outline of the silo.
    stroke("yellow");
    strokeWeight(3);
    noFill();
    line(0, 0, 0, SILO_HEIGHT);
    line(0, SILO_HEIGHT, SILO_WIDTH, SILO_HEIGHT);
    line(SILO_WIDTH, SILO_HEIGHT, SILO_WIDTH, 0);
    pop();

    // Draw the text label for the silo (fill level)
    push();
    translate(silosX[i], SILOS_TOP + SILO_HEIGHT);
    noStroke();
    fill("yellow");
    textAlign(CENTER, TOP);
    textSize(20);
    text(silos[i], SILO_WIDTH / 2, 10);
    pop();
  }
}

function mouseClicked() {
  for (let i = 0; i < upX.length; i++) {
    if (
      mouseX >= upX[i] &&
      mouseX <= upX[i] + BUTTON_SIZE &&
      mouseY >= BUTTON_TOP &&
      mouseY <= BUTTON_TOP + BUTTON_SIZE &&
      silos[i] < SILO_MAX
    ) {
      // Increase the fill level of the silo
      silos[i]++;
      return;
    }
  }

  for (let i = 0; i < downX.length; i++) {
    if (
      mouseX >= downX[i] &&
      mouseX <= downX[i] + BUTTON_SIZE &&
      mouseY >= BUTTON_TOP &&
      mouseY <= BUTTON_TOP + BUTTON_SIZE &&
      silos[i] > 0
    ) {
      // Decrease the fill level of the silo
      silos[i]--;
      return;
    }
  }
}