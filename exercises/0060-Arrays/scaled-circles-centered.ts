function setup() {
    createCanvas(400, 400);
    background("white");
    noFill();

    // Move the origin to the common center of the circles.
    // (150, 150) leaves enough room for the largest circle:
    // its diameter is 50 * 4 = 200 pixels.
    translate(150, 150);

    stroke("blue");
    strokeWeight(3);
    circle(0, 0, 50);
    
    push();
    stroke("red");
    scale(2);
    strokeWeight(3 / 2);
    // Note that we use the coordinates (0, 0) for the circle.
    // By using (0, 0), scale does NOT affect the position of the circle.
    circle(0, 0, 50);
    pop();
    
    push();
    stroke("green");
    scale(4.0);
    strokeWeight(3 / 4); 
    circle(0, 0, 50);
    pop();
}
