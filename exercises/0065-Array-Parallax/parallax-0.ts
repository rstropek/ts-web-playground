const THEME_IX = 0;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const HATI = "demo_figure2.png";
const SCROLL_SPEED = 5;

const images: p5.Image[] = [];
let hatiImage: p5.Image;

let backgroundScale = 1;
let scaledImageWidth = 0;
let scaledImageHeight = 0;

let scrollPosition = 0;

let spriteDirection = 1;
let spritePosition = 0;

let verticalPosition = 0;
let verticalVelocity = 0;
let isJumping = false;

function preload() {
    const theme = themes[THEME_IX];
    for (const imageName of theme) {
        const image = loadImage(getImageUrl(THEME_IX, imageName));
        images.push(image);
    }

    hatiImage = loadImage(getFigureUrl(HATI));
}

function setup() {
    createCanvas(500, 500);

    backgroundScale = width / images[0].width;
    scaledImageWidth = images[0].width * backgroundScale;
    scaledImageHeight = images[0].height * backgroundScale;

    spritePosition = width / 2;
    verticalPosition = 0;
}

function draw() {
    background("black");

    if (keyIsDown(39)) {
        if (spritePosition < width / 2) {
            spritePosition += SCROLL_SPEED;
        } else if (scrollPosition > -width) {
            scrollPosition = scrollPosition - SCROLL_SPEED;
        } else if (spritePosition < width - 30) {
            spritePosition += SCROLL_SPEED;
        }

        spriteDirection = -1;
    } else if (keyIsDown(37)) {
        if (spritePosition > width / 2) {
            spritePosition -= SCROLL_SPEED;
        } else if (scrollPosition < width) {
            scrollPosition += SCROLL_SPEED;
        } else if (spritePosition > 30) {
            spritePosition -= SCROLL_SPEED;
        }

        spriteDirection = 1;
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
    if (keyIsDown(32) && !isJumping) { // 32 is spacebar
        verticalVelocity = JUMP_FORCE;
        isJumping = true;
    }
    
    verticalVelocity += GRAVITY;
    verticalPosition += verticalVelocity;
    
    // Ground collision
    if (verticalPosition > 0) {
        verticalPosition = 0;
        verticalVelocity = 0;
        isJumping = false;
    }

    translate(spritePosition, scaledImageHeight + verticalPosition);
    scale(spriteDirection * -1, 1);
    imageMode(CENTER);
    image(hatiImage, 0, 5, hatiImage.width * backgroundScale * 0.8, hatiImage.height * backgroundScale * 0.8);
    pop();

    // Uncomment the following lines to draw a rectangle around the canvas. This will help you to see
    // how the background images move out of the visible area when you press the cursor keys. Use
    // these lines of code together with the commented _scale()_ and _translate()_ functions above.
    // push();
    // noFill();
    // stroke("red");
    // rect(0, 0, width, height);
    // pop();

    // resetMatrix();
    // push();
    // fill("white");
    // noStroke();
    // textSize(10);
    // textAlign(LEFT, TOP);
    // text(
    //     `Scroll position (x): ${scrollPosition}\n` +
    //     `Worm position (x): ${spritePosition}\n` +
    //     `Vertical position (y): ${verticalPosition.toFixed(1)}`,
    //     10, 10
    // );
    // pop();
}

