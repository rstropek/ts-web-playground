function setup() {
    createCanvas(300, 200);
}

const circleDiameter = 50;

let circleCenterX = 0;
let circleCenterY = 0;
let directionHorizontal = 2;
let directionVertical = 2;

// Remember: The _draw_ method is called FOR EVERY FRAME
function draw() {
    background("gold");

    stroke("white");
    strokeWeight(3);
    fill("lime");
    circle(circleCenterX, height / 2, circleDiameter);

    fill("aqua");
    circle(width / 2, circleCenterY, circleDiameter);

    circleCenterX += directionHorizontal;
    circleCenterY += directionVertical;

    //                         +----------------------------- OR operator
    //                         |
    //                         v
    if (circleCenterX >= width || circleCenterX <= 0) {
        // Reverse sign of direction (positive -> right, negative -> left)
        directionHorizontal *= -1; 
    }

    if (circleCenterY >= height || circleCenterY <= 0) {
        directionVertical *= -1; 
    }
}
