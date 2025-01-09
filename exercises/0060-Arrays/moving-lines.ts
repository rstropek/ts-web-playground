const CONFIGURATION = "5;0-360";

let lineStartXs: number[] = [];
let lineStartYs: number[] = [];
let lineEndXs: number[] = [];
let lineEndYs: number[] = [];
let lineColors: number[] = [];
let lineStartDxs: number[] = [];
let lineStartDys: number[] = [];
let lineEndDxs: number[] = [];
let lineEndDys: number[] = [];

let minColor = 0;
let maxColor = 0;

function setup() {
    createCanvas(500, 500);
    colorMode(HSB);

    let numberOfLines = 0;
    let buffer = "";
    for (let i = 0; i < CONFIGURATION.length; i++) {
        if (CONFIGURATION[i] === ";") {
            numberOfLines = parseInt(buffer);
            buffer = "";
        } else if (CONFIGURATION[i] === "-") {
            minColor = parseInt(buffer);
            buffer = "";
        } else {
            buffer += CONFIGURATION[i];
        }
    }
    maxColor = parseInt(buffer);

    const startDx = random(0, 5);
    const startDy = random(0, 5);
    const endDx = random(0, 5);
    const endDy = random(0, 5);

    const firstStartX = random(30, 470);
    const firstStartY = random(30, 470);
    const firstEndX = random(30, 470);
    const firstEndY = random(30, 470);

    // Initialize arrays with random values
    for (let i = 0; i < numberOfLines; i++) {
        lineStartXs[i] = firstStartX + random(-40, 40);
        lineStartYs[i] = firstStartY + random(-40, 40);
        lineEndXs[i] = firstEndX + random(-40, 40);
        lineEndYs[i] = firstEndY + random(-40, 40);

        lineStartDxs[i] = startDx;
        lineStartDys[i] = startDy;
        lineEndDxs[i] = endDx;
        lineEndDys[i] = endDy;

        lineColors[i] = random(minColor, maxColor);
    }
}

function draw() {
    background("black");

    push();
    strokeWeight(2);
    for (let i = 0; i < lineStartXs.length; i++) {
        stroke(lineColors[i], 100, 100);
        line(lineStartXs[i], lineStartYs[i], lineEndXs[i], lineEndYs[i]);

        // Update positions
        lineStartXs[i] += lineStartDxs[i];
        lineStartYs[i] += lineStartDys[i];
        lineEndXs[i] += lineEndDxs[i];
        lineEndYs[i] += lineEndDys[i];

        // Handle bouncing for start points
        if (lineStartXs[i] < 0 || lineStartXs[i] > 500) {
            lineStartDxs[i] = -lineStartDxs[i];
        }
        if (lineStartYs[i] < 0 || lineStartYs[i] > 500) {
            lineStartDys[i] = -lineStartDys[i];
        }

        // Handle bouncing for end points
        if (lineEndXs[i] < 0 || lineEndXs[i] > 500) {
            lineEndDxs[i] = -lineEndDxs[i];
        }
        if (lineEndYs[i] < 0 || lineEndYs[i] > 500) {
            lineEndDys[i] = -lineEndDys[i];
        }
    }
    pop();

    push();
    fill("white");
    noStroke();
    rect(10, 10, 50, 50);
    rect(70, 10, 50, 50);

    textSize(40);
    textAlign(CENTER, CENTER);
    fill("black");
    text("➕", 10, 13, 50, 50);
    text("➖", 70, 13, 50, 50);

    pop();
}

function mousePressed() {
    if (mouseX > 10 && mouseX < 60 && mouseY > 10 && mouseY < 60) {
        lineStartXs.push(Math.min(Math.max(lineStartXs[0] + random(-40, 40), 0), 500));
        lineStartYs.push(Math.min(Math.max(lineStartYs[0] + random(-40, 40), 0), 500));
        lineEndXs.push(Math.min(Math.max(lineEndXs[0] + random(-40, 40), 0), 500));
        lineEndYs.push(Math.min(Math.max(lineEndYs[0] + random(-40, 40), 0), 500));
        lineStartDxs.push(lineStartDxs[0]);
        lineStartDys.push(lineStartDys[0]);
        lineEndDxs.push(lineEndDxs[0]);
        lineEndDys.push(lineEndDys[0]);
        lineColors.push(random(minColor, maxColor));
    }

    if (mouseX > 70 && mouseX < 120 && mouseY > 10 && mouseY < 60 && lineStartXs.length > 1) {
        lineStartXs.splice(lineStartXs.length - 1, 1);
        lineStartYs.splice(lineStartYs.length - 1, 1);
        lineEndXs.splice(lineEndXs.length - 1, 1);
        lineEndYs.splice(lineEndYs.length - 1, 1);
        lineStartDxs.splice(lineStartDxs.length - 1, 1);
        lineStartDys.splice(lineStartDys.length - 1, 1);
        lineEndDxs.splice(lineEndDxs.length - 1, 1);
        lineEndDys.splice(lineEndDys.length - 1, 1);
        lineColors.splice(lineColors.length - 1, 1);
    }
}
