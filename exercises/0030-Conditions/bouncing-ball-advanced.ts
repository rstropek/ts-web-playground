const circleDiameter = 50;

// Current center of the ball
let circleCenterX: number;
let circleCenterY: number;

// Current direction of the ball in X- and Y-direction
let directionX = 2;
let directionY = 2;

function setup() {
    createCanvas(300, 200);
    circleCenterX = random(0, width);
    circleCenterY = random(0, height);
}

function draw() {
    background("gold");

    stroke("white");
    strokeWeight(3);
    fill("lime");
    circle(circleCenterX, circleCenterY, circleDiameter);

    circleCenterX += directionX;
    circleCenterY += directionY;

    if (circleCenterX <= 0 || circleCenterX >= width) {
        directionX *= -1;
    }
    if (circleCenterY <= 0 || circleCenterY >= height) {
        directionY *= -1;
    }
}