// The following string represents coordinates (x,y) of circles
// that you have to draw. Each circle must have a radius of 40.
const circles = "50,50 50,100 100,50 100,100";

function setup() {
    createCanvas(400, 400);
    background("white");
    noFill();
    stroke("black");
    strokeWeight(3);

    let x = 0; // x coordinate of the current circle
    let y = 0; // y coordinate of the current circle
    let coordinates = ""; // Buffer the current coordinate
    for (let ix = 0; ix < circles.length; ix++) {
        switch (circles[ix]) {
            case ",":
                // We found a comma, so the current x coordinate is complete.
                // NEW: Use _parseInt_ to convert the string to a number.
                x = parseInt(coordinates);
                coordinates = "";
                break;
            case " ":
                // We found a space, so the current y coordinate is complete.
                // We use _parseInt_ again to convert the string to a number.
                y = parseInt(coordinates);
                // Now that we have both coordinates, we can draw the circle.
                circle(x, y, 40);
                coordinates = "";
                break;
            default:
                // If the character is not a comma or a space, it must be a number.
                // We append the character to the buffer that will be parsed
                // with _parseInt_ later.
                coordinates += circles[ix];
                break;
        }
    }

    // The last circle has not been drawn because there is no space after it. We draw it now.
    y = parseInt(coordinates);
    circle(x, y, 40);
}
