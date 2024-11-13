function setup() {
    const SIZE = 400;  // Size of canvas
    const STRIPE_THICKNESS = 50; // Thickness of the stripes

    createCanvas(SIZE, SIZE);
    background("black");

    noStroke();

    let i = 0;
    while (i * STRIPE_THICKNESS <= SIZE) {
        if (i % 2 === 0) {
            fill("lime");
        } else {
            fill("yellow");
        }

        rect(0, i * STRIPE_THICKNESS, width, STRIPE_THICKNESS);

        i++;
    }
}
