// URL where the images are stored. You have to append the theme name (see also _themeNames_ below)
// and the image name to get the full URL. Example: To get the URL of the first image of the 
// _cave_ theme, use `${BASE_URL}/cave/1_wall.png`.
const BASE_URL_BACKGROUND = "https://cddataexchange.blob.core.windows.net/images/parallax";
const BASE_URL_FIGURES = "https://cddataexchange.blob.core.windows.net/images/figureBuilder";

// Define the images for the different themes. The first image must be drawn first because it is the farthest away.
// The last image must be drawn last because it is the closest to the viewer.
const cave = [
    "1_wall.png",
    "2_prop01.png",
    "3_prop02.png",
    "4_stones.png",
    "5_crystals.png",
    "6_ground.png"
];
const mountains = [
    "1_sky.png",
    "2_mountains.png",
    "3_clouds.png",
    "4_bg-ground01.png",
    "5_bg-ground02.png",
    "6_ground.png"
];
const winter = [
    "1_sky.png",
    "2_stars.png",
    "3_clouds01.png",
    "4_clouds02.png",
    "5_mountains.png",
    "6_ground01.png",
    "7_ground02.png",
    "8_ground.png"
];
const dessert = [
    "1_sky.png",
    "2_clouds.png",
    "3_pyramid.png",
    "4_bg-ground01.png",
    "5_bg-ground02.png",
    "6_bg-ground03.png",
    "7_ground.png"
];
const hatiLegs = [
    "Biene%20Beine.png",
    "Creeper%20Beine.png",
    "Hati%20Beine.png"
];
const hatiFaces = [
    "Biene%20Gesicht.png",
    "Creeper%20Gesicht.png",
    "Hati%20Gesicht.png"
];
const hatiHeads = [
    "Biene%20Kopf.png",
    "Creeper%20Kopf.png",
    "Hati%20Kopf.png"
];

// _themes_ is an array of arrays. Each sub-array contains the image names for one theme.
// If you want to get the theme _cave_, use _themes[0]_, for _winter_ use _themes[2]_, and so on.
const themes = [
    cave,
    mountains,
    winter,
    dessert
];

// The names of the themes. The order must match the order of the themes in the _themes_ array.
const themeNames = [
    "cave",
    "mountains",
    "winter",
    "dessert"
]

const THEME_IX = 3;

const images: p5.Image[] = [];

let hatiFace: p5.Image;
let hatiLeg: p5.Image;
let hatiHead: p5.Image;
const HATI_SCALE = 0.20;

let backgroundScale = 1;
let scaledImageWidth = 0;
let scaledImageHeight = 0;

const SCROLL_SPEED = 5;
let scrollPosition = 0;

let wormFrame = 0;
let wormDirection = 1;
let wormPosition = 0;

function preload() {
    const theme = themes[THEME_IX];
    for (let i = 0; i < theme.length; i++) {
        const imageName = theme[i];
        const image = loadImage(`${BASE_URL_BACKGROUND}/${themeNames[THEME_IX]}/${imageName}`);
        images.push(image);
    }

    hatiFace = loadImage(`${BASE_URL_FIGURES}/HATI/${hatiFaces[2]}`);
    hatiLeg = loadImage(`${BASE_URL_FIGURES}/HATI/${hatiLegs[2]}`);
    hatiHead = loadImage(`${BASE_URL_FIGURES}/HATI/${hatiHeads[2]}`);
}

function setup() {
    createCanvas(500, 500);

    backgroundScale = width / images[0].width;
    scaledImageWidth = images[0].width * backgroundScale;
    scaledImageHeight = images[0].height * backgroundScale;

    wormPosition = width / 2;
}

function draw() {
    background("black");

    if (keyIsDown(39)) {
        if (wormPosition < width / 2) {
            wormPosition += SCROLL_SPEED;
        } else if (scrollPosition > -width) {
            scrollPosition = scrollPosition - SCROLL_SPEED;
        } else if (wormPosition < width - 30) {
            wormPosition += SCROLL_SPEED;
        }

        wormDirection = -1;
        wormFrame++;
    } else if (keyIsDown(37)) {
        if (wormPosition > width / 2) {
            wormPosition -= SCROLL_SPEED;
        } else if (scrollPosition < width) {
            scrollPosition += SCROLL_SPEED;
        } else if (wormPosition > 30) {
            wormPosition -= SCROLL_SPEED;
        }

        wormFrame++;
        wormDirection = 1;
    }

    // Uncomment the following lines to zoom out. This will make it easier for you
    // to see how the background images move out of the visible area when you press the cursor keys.
    //scale(0.5);
    //translate(width / 2, height / 2);

    push();
    translate(0, (height - scaledImageHeight) / 2);

    // This time, we do NOT translate ALL the images by the same amount (scrollPosition).
    // Instead, we move each layer by a fraction of the scrollPosition. The most distant
    // layer moves by the smallest amount (scrollPosition / images.length), the next layer
    // moves by twice that amount, and so on. The closest layer moves by the largest
    // amount.
    const step = scrollPosition / images.length;

    for (let i = 0; i < images.length; i++) {
        // Move each layer by a fraction of the scrollPosition. NOTE that we will call
        // the _translate()_ function multiple times. As you already know, calls to _translate()_
        // are cumulative. This means that the first layer will be moved by _step_, the second
        // layer will be moved by _2 * step_, the third layer will be moved by _3 * step_, and so on.
        // This will create the parallax effect.
        translate(step, 0);

        const img = images[i];

        image(img, -scaledImageWidth, 0, scaledImageWidth, scaledImageHeight);
        image(img, 0, 0, scaledImageWidth, scaledImageHeight);
        image(img, scaledImageWidth, 0, scaledImageWidth, scaledImageHeight);
    }
    pop();

    push();
    translate(wormPosition, scaledImageHeight);
    scale(wormDirection * -1, 1);
    imageMode(CENTER);
    image(hatiLeg, 0, 1050 * backgroundScale * HATI_SCALE, hatiLeg.width * backgroundScale * HATI_SCALE, hatiLeg.height * backgroundScale * HATI_SCALE);
    image(hatiHead, 0, 0, hatiHead.width * backgroundScale * HATI_SCALE, hatiHead.height * backgroundScale * HATI_SCALE);
    image(hatiFace, 0, 0, hatiFace.width * backgroundScale * HATI_SCALE, hatiFace.height * backgroundScale * HATI_SCALE);
    pop();

    // Uncomment the following lines to draw a rectangle around the canvas. This will help you to see
    // how the background images move out of the visible area when you press the cursor keys. Use
    // these lines of code together with the commented _scale()_ and _translate()_ functions above.
    push();
    noFill();
    stroke("red");
    rect(0, 0, width, height);
    pop();

    resetMatrix();
    push();
    fill("white");
    noStroke();
    textSize(10);
    textAlign(LEFT, TOP);
    text(`Scroll position (x): ${scrollPosition}\nWorm position (x): ${wormPosition}`, 10, 10);
    pop();
}