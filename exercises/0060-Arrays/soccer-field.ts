// It must be possible to scale the entire field by changing the value of the constant SCALE.
// E.g. a SCALE value of 2 will create a small image, while a SCALE value of 10 will create a large image.
const SCALE = 5;

// Margin around the field (i.e. distance from edge to the field)
const MARGIN = 4;

// Player numbers
const playerNumbers: number[] = [1, 17, 22, 23, 20, 6, 15, 5, 11, 7, 9];

// First names
const firstNames: string[] = [
  "Thibaut", "Lucas", "Antonio", "Ferland", "Fran",
  "Eduardo", "Federico", "Jude", "Rodrygo", "Vinícius", "Kylian"
];

// Last names
const lastNames: string[] = [
  "Courtois", "Vázquez", "Rüdiger", "Mendy", "García",
  "Camavinga", "Valverde", "Bellingham", "Goes", "Júnior", "Mbappé"
];

function setup() {
    createCanvas((100 + MARGIN * 2) * SCALE, (70 + MARGIN * 2) * SCALE);
    background("green");

    strokeWeight(0.5);
    stroke("white");
    noFill();
    angleMode(DEGREES);

    push();

    // Note that we scale everything by the constant SCALE. We use the size values
    // in meters as if they were pixels, and then scale them up by the SCALE factor.
    scale(SCALE);
    translate(MARGIN, MARGIN);

    // Field (100x70m)
    rect(0, 0, 100, 70);

    // Midfield line
    line(50, 0, 50, 70);

    // Midfield circle (9.15m radius)
    circle(50, 35, 9.15 * 2);

    // Penalty arc ("Strafraumhalbkreis")
    // (9.15m radius, penalty spot is center)
    circle(11, 35, 9.15 * 2);
    circle(100 - 11, 35, 9.15 * 2);

    // Penalty area ("Strafraum")
    // (40.32m width, 16.5m depth)
    fill("green");
    rect(0, 35 - 40.32 / 2, 16.5, 40.32);
    rect(100 - 16.5, 35 - 40.32 / 2, 16.5, 40.32);
    noFill();

    // Goal ("Tor")
    // (7.32m width, 3m depth)
    rect(-3, 35 - 7.32 / 2, 3, 7.32);
    rect(100, 35 - 7.32 / 2, 3, 7.32);

    // Goal area ("Torraum")
    // (18.32m width, 5.5m depth)
    rect(0, 35 - 18.32 / 2, 5.5, 18.32);
    rect(100 - 5.5, 35 - 18.32 / 2, 5.5, 18.32);

    // Penalty spot ("Elfmeterpunkt")
    circle(11, 35, 0.5);
    circle(100 - 11, 35, 0.5);

    // Center spot ("Mittelpunkt")
    circle(50, 35, 1);

    // Corner arcs ("Viertelkreis")
    // (1m radius)
    arc(0, 0, 2, 2, 0, 90);
    arc(0, 70, 2, 2, 270, 360);
    arc(100, 0, 2, 2, 90, 180);
    arc(100, 70, 2, 2, 180, 270);
    
    noStroke();

    // NEW: Note that the color value has EIGHT hex digits, not six.
    // The last two digits represent the alpha value (transparency).
    // The hex value d0 (208 in decimal) is 80% opaque.
    fill("#008000d0");
    rect(10, 5, 80, 60);
    
    textSize(4);
    fill("orange")
    textAlign(RIGHT);
    textStyle(BOLD);
    for (let i = 0; i < playerNumbers.length; i++) {
        text(i + 1, 30, 12 + i * 5);
    }
    
    fill("yellow")
    textAlign(LEFT);
    textStyle(NORMAL);
    for (let i = 0; i < firstNames.length; i++) {
        text(`${firstNames[i]} ${lastNames[i]}`, 33, 12 + i * 5);
    }

    pop();
}
