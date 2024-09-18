function setup() {
    createCanvas(400, 200);
    noFill(); // We only need the outlines
    strokeWeight(10); // Set the thickness of the ring outlines

    // We want to use degrees, not rad. Want to learn more?
    // https://brilliant.org/wiki/degrees-radian/
    angleMode(DEGREES);

    // Part of blue ring
    stroke("blue");
    //                    +-------- start angle
    //                    |   +---- end angle
    //                    v   v
    arc(100, 100, 80, 80, 45, 315);

    // Parts of black ring
    stroke("black");
    arc(200, 100, 80, 80, 135, 315);
    arc(200, 100, 80, 80, 45, 90);

    // Part of red ring
    stroke("red");
    arc(300, 100, 80, 80, 135, 90);

    // Gold ring
    stroke("gold");
    circle(150, 140, 80);

    // Another part of black ring
    stroke("black");
    arc(200, 100, 80, 80, 90, 135);

    // Blue ring
    stroke("blue");
    arc(100, 100, 80, 80, 315, 45);

    // Green ring
    stroke("green");
    circle(250, 140, 80);

    // Last part of black ring
    stroke("black");
    arc(200, 100, 80, 80, 315, 45);

    stroke("red");
    arc(300, 100, 80, 80, 90, 135);
}
