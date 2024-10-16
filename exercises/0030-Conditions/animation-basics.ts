const BASE_URL = "https://cddataexchange.blob.core.windows.net/images/NecromancerHalloween/Walking";
const IMAGE_SCALE = 0.2;

let necromancer0: p5.Image;
let necromancer1: p5.Image;
let necromancer2: p5.Image;
let necromancer3: p5.Image;
let necromancer4: p5.Image;
let necromancer5: p5.Image;
let necromancer6: p5.Image;
let necromancer7: p5.Image;
let necromancer8: p5.Image;
let necromancer9: p5.Image;

function preload() {
    necromancer0 = loadImage(`${BASE_URL}/Necromancer_01__WALK_000.png`);
    necromancer1 = loadImage(`${BASE_URL}/Necromancer_01__WALK_001.png`);
    necromancer2 = loadImage(`${BASE_URL}/Necromancer_01__WALK_002.png`);
    necromancer3 = loadImage(`${BASE_URL}/Necromancer_01__WALK_003.png`);
    necromancer4 = loadImage(`${BASE_URL}/Necromancer_01__WALK_004.png`);
    necromancer5 = loadImage(`${BASE_URL}/Necromancer_01__WALK_005.png`);
    necromancer6 = loadImage(`${BASE_URL}/Necromancer_01__WALK_006.png`);
    necromancer7 = loadImage(`${BASE_URL}/Necromancer_01__WALK_007.png`);
    necromancer8 = loadImage(`${BASE_URL}/Necromancer_01__WALK_008.png`);
    necromancer9 = loadImage(`${BASE_URL}/Necromancer_01__WALK_009.png`);
}

function setup() {
    createCanvas(necromancer0.width * IMAGE_SCALE, necromancer0.height * IMAGE_SCALE);
    frameRate(20);
}

let imageIndex = 0;
let x = -500

function draw() {
    background("lightgray");

    let currentImage: p5.Image;

    // Check the value of imageIndex and assign the corresponding image
    if (imageIndex === 0) { currentImage = necromancer0; }
    else if (imageIndex === 1) { currentImage = necromancer1; }
    else if (imageIndex === 2) { currentImage = necromancer2; }
    else if (imageIndex === 3) { currentImage = necromancer3; }
    else if (imageIndex === 4) { currentImage = necromancer4; }
    else if (imageIndex === 5) { currentImage = necromancer5; }
    else if (imageIndex === 6) { currentImage = necromancer6; }
    else if (imageIndex === 7) { currentImage = necromancer7; }
    else if (imageIndex === 8) { currentImage = necromancer8; }
    else if (imageIndex === 9) { currentImage = necromancer9; }

    // Draw the selected image on the canvas
    image(currentImage, x, 0, necromancer0.width * IMAGE_SCALE, necromancer0.height * IMAGE_SCALE);

    imageIndex++;
    if (imageIndex === 10) { imageIndex = 0; }

    x += 5;
    if (x > 500) { x = -500; }
}
