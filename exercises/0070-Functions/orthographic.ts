const RAILROAD_WIDTH: number = 225;
const RAILROAD_HEIGHT: number = 160;

const WAGON_WIDTH: number = 160;
const WAGON_HEIGHT: number = 113;

let railroad: p5.Image;
let train: p5.Image;

const BASE_URL: string = "https://cddataexchange.blob.core.windows.net/images/trains";

async function setup(): Promise<void> {
    railroad = await loadImage(`${BASE_URL}/railroad-straight.png`);
    train = await loadImage(`${BASE_URL}/train-carriage-wood.png`);

    createCanvas(800, 550);
}

function draw(): void {
    background("#f0f0f0");

    scale(0.5, 0.5);

    // Move the origin to the right, upper corner. This makes sense
    // because we must draw the images from right to left so that
    // objects that are further left are "on top" of objects on
    // the right.
    translate(850, -100);

    // Loop for tracks
    for (let track = 0; track < 3; track++) {
        // Draw five railroad segments
        for (let i = 0; i < 5; i++) {
            drawRailroad(i);
        }

        // Draw six train wagons
        for (let i = 0; i < 6; i++) {
            drawTrainWagon(i);
        }

        translate(125, 100);
    }
}

/** Draw a railroad segment */
function drawRailroad(ix: number): void {
    image(railroad, -RAILROAD_WIDTH * ix, RAILROAD_HEIGHT * ix, railroad.width, railroad.height);
}

/** Draw a train wagon */
function drawTrainWagon(ix: number): void {
    image(train, -WAGON_WIDTH * ix, WAGON_HEIGHT * ix, train.width, train.height);
}
