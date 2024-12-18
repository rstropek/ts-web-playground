function setup() {
    createCanvas(400, 400);
    background("white");
    noFill();

    // Draw a blue circle
    stroke("blue");
    strokeWeight(3);
    circle(50, 50, 50);
    
    // Draw a red circle with a scale of 2
    push(); // Saves the current drawing settings
    stroke("red");
    scale(2); // NEW: Scales the drawing by 2
    strokeWeight(3 / 2); // Scaling also affects the stroke weight
                         // -> scale it down so that the stroke weight remains
                         // visually the same
    circle(50, 50, 50);
    pop(); // Restores the drawing settings
    
    // Repeat the same with scale 4 and green color
    push();
    stroke("green");
    scale(4.0);
    strokeWeight(3 / 4); 
    circle(50, 50, 50);
    pop();
}
