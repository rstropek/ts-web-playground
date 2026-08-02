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

async function setup() {
    [
        necromancer0,
        necromancer1,
        necromancer2,
        necromancer3,
        necromancer4,
        necromancer5,
        necromancer6,
        necromancer7,
        necromancer8,
        necromancer9,
    ] = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
            loadImage(`${BASE_URL}/Necromancer_01__WALK_00${i}.png`)
        )
    );

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
