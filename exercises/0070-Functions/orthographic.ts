const RAILROAD_WIDTH = 225;
const RAILROAD_HEIGHT = 160;

const WAGON_WIDTH = 160;
const WAGON_HEIGHT = 113;

let railroad: p5.Image;
let train: p5.Image;

const BASE_URL = "https://cddataexchange.blob.core.windows.net/images/trains";

function preload() {
    railroad = loadImage(`${BASE_URL}/railroad-straight.png`);
    train = loadImage(`${BASE_URL}/train-carriage-wood.png`);
}

function setup() {
    createCanvas(800, 550);
}

function draw() {
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
function drawRailroad(ix: number) {
    image(railroad, -RAILROAD_WIDTH * ix, RAILROAD_HEIGHT * ix, railroad.width, railroad.height);

}

/** Draw a train wagon */
function drawTrainWagon(ix: number) {
    image(train, -WAGON_WIDTH * ix, WAGON_HEIGHT * ix, train.width, train.height);

}