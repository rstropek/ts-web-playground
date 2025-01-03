const THEME_IX = 2;

const images: p5.Image[] = [];

let backgroundScale = 1;
let scaledImageWidth = 0;
let scaledImageHeight = 0;

// Number of pixels to scroll when the user presses the cursor keys
const SCROLL_SPEED = 5;

// Current scroll position in x direction. A positive value means that the background
// images are moved to the right. A negative value means that the background images are moved to the left.
let scrollPosition = 0;

function preload() {
    // Same code as in the previous example

    const theme = themes[THEME_IX];
    for (let i = 0; i < theme.length; i++) {
        const imageName = theme[i];
        const image = loadImage(`${BASE_URL}${themeNames[THEME_IX]}/${imageName}`);
        images.push(image);
    }
}

function setup() {
    // Same code as in the previous example

    createCanvas(500, 500);

    backgroundScale = width / images[0].width;
    scaledImageWidth = images[0].width * backgroundScale;
    scaledImageHeight = images[0].height * backgroundScale;
}

function draw() {
    background("black");

    // Check if user presses the cursor keys.
    if (keyIsDown(39) && scrollPosition > -width) {
        // Cursor right
        scrollPosition = scrollPosition - SCROLL_SPEED;
    } else if (keyIsDown(37) && scrollPosition < width) {
        // Cursor left
        scrollPosition += SCROLL_SPEED;
    }

    // Uncomment the following lines to zoom out. This will make it easier for you
    // to see how the background images move out of the visible area when you press the cursor keys.
    scale(0.5);
    translate(width / 2, height / 2);

    push();

    // Translate the background images according to the current scroll position
    translate(scrollPosition, 0);

    // From here on, the code is the same as in the previous example
    translate(0, (height - scaledImageHeight) / 2);
    for (let i = 0; i < images.length; i++) {
        const img = images[i];

        // Draw background image to the left...
        image(img, -scaledImageWidth, 0, scaledImageWidth, scaledImageHeight);
        
        image(img, 0, 0, scaledImageWidth, scaledImageHeight);

        // ... and one background image to the right.
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