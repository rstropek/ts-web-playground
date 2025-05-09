const THEME_IX = 2;

const images: p5.Image[] = [];

let backgroundScale = 1;
let scaledImageWidth = 0;
let scaledImageHeight = 0;

const SCROLL_SPEED = 5;
let scrollPosition = 0;

function preload() {
    const theme = themes[THEME_IX];
    for (let i = 0; i < theme.length; i++) {
        const imageName = theme[i];
        const image = loadImage(`${BASE_URL}/${themeNames[THEME_IX]}/${imageName}`);
        images.push(image);
    }
}

function setup() {
    createCanvas(500, 500);

    backgroundScale = width / images[0].width;
    scaledImageWidth = images[0].width * backgroundScale;
    scaledImageHeight = images[0].height * backgroundScale;
}

function draw() {
    background("black");

    if (keyIsDown(39) && scrollPosition > -width) {
        scrollPosition = scrollPosition - SCROLL_SPEED;
    } else if (keyIsDown(37) && scrollPosition < width) {
        scrollPosition += SCROLL_SPEED;
    }

    // Uncomment the following lines to zoom out. This will make it easier for you
    // to see how the background images move out of the visible area when you press the cursor keys.
    scale(0.5);
    translate(width / 2, height / 2);

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
    text(`Scroll position (x): ${scrollPosition}`, 10, 10);
    pop();
}