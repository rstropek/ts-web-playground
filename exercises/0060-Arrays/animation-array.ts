const BASE_URL = "https://cddataexchange.blob.core.windows.net/images/NecromancerHalloween/Walking";
const IMAGE_SCALE = 0.2;

// Our animation will be a series of 10 images
let necromancers: p5.Image[] = [];

function preload() {
    // Load all the images.
    for (let i = 0; i < 10; i++) {
        necromancers.push(loadImage(`${BASE_URL}/Necromancer_01__WALK_00${i}.png`));
    }
}

function setup() {
    createCanvas(necromancers[0].width * IMAGE_SCALE, necromancers[0].height * IMAGE_SCALE);
    frameRate(20);
}

let imageIndex = 0;
let x = -500

function draw() {
    background("lightgray");

    let currentImage: p5.Image;

    // Assign the corresponding image
    currentImage = necromancers[imageIndex];

    // Draw the selected image on the canvas
    image(currentImage, x, 0, currentImage.width * IMAGE_SCALE, currentImage.height * IMAGE_SCALE);

    imageIndex = (imageIndex + 1) % necromancers.length;

    x += 5;
    if (x > 500) { x = -500; }
}
