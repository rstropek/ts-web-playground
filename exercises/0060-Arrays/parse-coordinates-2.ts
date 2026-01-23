// The following string represents coordinates (x,y) of points
// that you have to connect with lines. Each line connects two consecutive points.
const points = "200,100 300,150 300,250 200,300 100,250 100,150 200,100";

function setup() {
    createCanvas(400, 400);
    background("white");
    stroke("black");
    strokeWeight(3);

    let x1 = 0; // x coordinate of the current line's start point
    let y1 = 0; // y coordinate of the current line's start point
    let x2 = 0; // x coordinate of the current line's end point
    let y2 = 0; // y coordinate of the current line's end point
    let coordinates = ""; // Buffer the current coordinate
    let isFirstPoint = true; // Track if we're parsing the very first point

    for (let ix = 0; ix < points.length; ix++) {
        switch (points[ix]) {
            case ",":
                // We found a comma, so the current x coordinate is complete.
                x2 = parseInt(coordinates);
                coordinates = "";
                break;
            case " ":
                // We found a space, so the current y coordinate is complete.
                y2 = parseInt(coordinates);
                
                if (!isFirstPoint) {
                    // Draw a line from the previous point to the current point.
                    line(x1, y1, x2, y2);
                }
                
                // The current end point becomes the next start point.
                x1 = x2;
                y1 = y2;
                isFirstPoint = false;
                coordinates = "";
                break;
            default:
                // If the character is not a comma or a space, it must be a number.
                // We append the character to the buffer that will be parsed
                // with _parseInt_ later.
                coordinates += points[ix];
                break;
        }
    }

    // The last point has not been processed because there is no space after it.
    y2 = parseInt(coordinates);
    line(x1, y1, x2, y2);
}