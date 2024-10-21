const MARGIN_NUM = 10;

let num: number = 0;
let lineHeight: number = 0;
let cellWidth: number = 0;

function setup() {
    createCanvas(300, 500);
    lineHeight = height / 5;
    cellWidth = width / 3;
}

function draw() {
    background("lightgray");

    noStroke();
    fill("white");
    rect(MARGIN_NUM, MARGIN_NUM, width - 2 * MARGIN_NUM, lineHeight - 2 * MARGIN_NUM);

    stroke("black");
    fill("black");
    strokeWeight(2);
    textSize(50);

    textAlign(RIGHT, CENTER);
    text(num, width - MARGIN_NUM * 2, lineHeight / 2);

    textAlign(CENTER, CENTER);

    let y = lineHeight * 1;
    line(0, y, width, y);
    text('7', width / 3 * 0 + cellWidth / 2, y + lineHeight / 2);
    text('8', width / 3 * 1 + cellWidth / 2, y + lineHeight / 2);
    text('9', width / 3 * 2 + cellWidth / 2, y + lineHeight / 2);

    y += lineHeight;
    line(0, y, width, y);
    text('4', width / 3 * 0 + cellWidth / 2, y + lineHeight / 2);
    text('5', width / 3 * 1 + cellWidth / 2, y + lineHeight / 2);
    text('6', width / 3 * 2 + cellWidth / 2, y + lineHeight / 2);

    y += lineHeight;
    line(0, y, width, y);
    text('1', width / 3 * 0 + cellWidth / 2, y + lineHeight / 2);
    text('2', width / 3 * 1 + cellWidth / 2, y + lineHeight / 2);
    text('3', width / 3 * 2 + cellWidth / 2, y + lineHeight / 2);

    y += lineHeight;
    line(0, y, width, y);
    text('0', cellWidth, y + lineHeight / 2);
    text('C', cellWidth * 2.5, y + lineHeight / 2);
    
    let x = cellWidth * 1;
    line(x, lineHeight, x, height - lineHeight);

    x += cellWidth;
    line(x, lineHeight, x, height);
}

function mouseClicked() {
  if (mouseY > lineHeight && mouseY <= height && mouseX >= 0 && mouseX <= width) {
    const clickedY = Math.floor((mouseY - lineHeight) / lineHeight);
    const clickedX = Math.floor(mouseX / cellWidth);
    
    let digit: number = -1;
    if (clickedY === 0) {
        if (clickedX === 0) { digit = 7; }
        else if (clickedX === 1) { digit = 8; }
        else if (clickedX === 2) { digit = 9; }
    } else if (clickedY === 1) {
        if (clickedX === 0) { digit = 4; }
        else if (clickedX === 1) { digit = 5; }
        else if (clickedX === 2) { digit = 6; }
    } else if (clickedY === 2) {
        if (clickedX === 0) { digit = 1; }
        else if (clickedX === 1) { digit = 2; }
        else if (clickedX === 2) { digit = 3; }
    } else if (clickedX !== 2) { digit = 0; }

    if (digit === -1) {
        num = 0;
    } else {
        const oldNum = num;
        num = num * 10 + digit;
        if (num >= 1000000000) {
            num = oldNum;
        }
    }
  }
}