const diamondSize = 50;

// Current center of the diamond
let diamondCenterX: number;
let diamondCenterY: number;

// Current direction of the diamond in X- and Y-direction
let directionX = 2;
let directionY = 2;

// Bounce counter (starts at 10, decreases on bounce)
let bounces = 10;

function setup() {
    createCanvas(300, 300);
    diamondCenterX = width / 2;
    diamondCenterY = diamondSize / 2;
}

function draw() {
    background("gold");

    // Draw diamond with highlighted leading edge
    strokeWeight(3);
    noFill();
    
    const halfSize = diamondSize / 2;
    
    // Top vertex
    const topX = diamondCenterX;
    const topY = diamondCenterY - halfSize;
    
    // Right vertex
    const rightX = diamondCenterX + halfSize;
    const rightY = diamondCenterY;
    
    // Bottom vertex
    const bottomX = diamondCenterX;
    const bottomY = diamondCenterY + halfSize;
    
    // Left vertex
    const leftX = diamondCenterX - halfSize;
    const leftY = diamondCenterY;
    
    // Top-right line (NE direction)
    if (directionX > 0 && directionY < 0) {
        stroke("red");
    } else {
        stroke("white");
    }
    line(topX, topY, rightX, rightY);
    
    // Right-bottom line (SE direction)
    if (directionX > 0 && directionY > 0) {
        stroke("red");
    } else {
        stroke("white");
    }
    line(rightX, rightY, bottomX, bottomY);
    
    // Bottom-left line (SW direction)
    if (directionX < 0 && directionY > 0) {
        stroke("red");
    } else {
        stroke("white");
    }
    line(bottomX, bottomY, leftX, leftY);
    
    // Left-top line (NW direction)
    if (directionX < 0 && directionY < 0) {
        stroke("red");
    } else {
        stroke("white");
    }
    line(leftX, leftY, topX, topY);
    
    // Draw bounce counter
    fill("black");
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text(bounces, diamondCenterX, diamondCenterY);
    
    // Move diamond only if bounces remain
    if (bounces > 0) {
        diamondCenterX += directionX;
        diamondCenterY += directionY;
        
        // Check collisions and count bounces
        if (diamondCenterX - halfSize <= 0 || diamondCenterX + halfSize >= width) {
            directionX *= -1;
            bounces--;
        }
        if (diamondCenterY - halfSize <= 0 || diamondCenterY + halfSize >= height) {
            directionY *= -1;
            bounces--;
        }
    }
}