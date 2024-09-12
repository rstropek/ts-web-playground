function setup() {
    // Create the canvas (German: "Leinwand")
    // Paramters are width and height
    createCanvas(400, 500);

    // Set background color
    background("pink");

    // Set line color and thickness (=weight)
    stroke("white");
    strokeWeight(5);

    // Fill color
    fill("skyblue");

    // Draw a line
    line(20, 20, 380, 20);

    // Draw a rectangle
    rect(20, 40, 360, 20);

    // Do not fill the following shapes
    noFill();

    // Draw a circle
    circle(200, 260, 360);

    // Draw a triangle
    fill("lime");
    triangle(100, 300, 200, 200, 300, 300);
}
