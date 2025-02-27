/** Base URL for images */
const BASE_URL = "https://cddataexchange.blob.core.windows.net/images/trains";

/** Image names for train wagons */
const imageUrls = [
    "train-carriage-box.png",
    "train-carriage-coal.png",
    "train-carriage-container-blue.png",
    "train-carriage-container-green.png",
    "train-carriage-container-red.png",
    "train-carriage-dirt.png",
    "train-carriage-flatbed-wood.png",
    "train-carriage-flatbed.png",
    "train-carriage-lumber.png",
    "train-carriage-tank-large.png",
    "train-carriage-tank.png",
    "train-carriage-wood.png",
    "train-diesel-a.png",
    "train-diesel-b.png",
    "train-diesel-box-a.png",
    "train-diesel-box-b.png",
    "train-diesel-box-c.png",
    "train-diesel-c.png",
    "train-electric-bullet-a.png",
    "train-electric-bullet-b.png",
    "train-electric-bullet-c.png",
    "train-electric-city-a.png",
    "train-electric-city-b.png",
    "train-electric-city-c.png",
    "train-electric-double-a.png",
    "train-electric-double-b.png",
    "train-electric-double-c.png",
    "train-electric-square-a.png",
    "train-electric-square-b.png",
    "train-electric-square-c.png",
    "train-electric-subway-a.png",
    "train-electric-subway-b.png",
    "train-electric-subway-c.png",
    "train-locomotive-a.png",
    "train-locomotive-b.png",
    "train-locomotive-c.png",
    "train-locomotive-passenger-a.png",
    "train-locomotive-passenger-b.png",
    "train-tram-classic.png",
    "train-tram-modern.png",
    "train-tram-round.png",
];

/**
* Abbreviations for train wagons
* 
* Indices in abbreviations correspond to image names in imageUrls above.
* e.g. index 0 "TCB" corresponds to imageUrls[0] "train-carriage-box.png"
* e.g. index 1 "TCC" corresponds to imageUrls[1] "train-carriage-coal.png"
* etc.
*/
const abbreviations = [
    "TCB",
    "TCC",
    "TCCB",
    "TCCG",
    "TCCR",
    "TCD",
    "TCFW",
    "TCF",
    "TCL",
    "TCTL",
    "TCT",
    "TCW",
    "TDA",
    "TDB",
    "TDBA",
    "TDBB",
    "TDBC",
    "TDC",
    "TEBA",
    "TEBB",
    "TEBC",
    "TECA",
    "TECB",
    "TECC",
    "TEDA",
    "TEDB",
    "TEDC",
    "TESA",
    "TESB",
    "TESC",
    "TESA",
    "TESB",
    "TESC",
    "TLA",
    "TLB",
    "TLC",
    "TLPA",
    "TLPB",
    "TTC",
    "TTM",
    "TTR"
];

const RAILROAD_WIDTH = 225;
const RAILROAD_HEIGHT = 160;

const WAGON_WIDTH = 160;
const WAGON_HEIGHT = 113;

let railroad: p5.Image;
const train: p5.Image[] = [];
let trains: p5.Image[][] = [];

/** Input text for minimum requirements */
const TRAIN = "TLB,TCCG,TCTL,TCW,TCL,TCCR"

/** Input text for ADVANCED requirements */
const TRACKS = "TLB,TCCG,TCTL,TCW,TCL,TCCR;TEDA,TEDB,TEDB,TEDC,TEDB;TDA,TCF,TCC,TCC,TCB,TCD"

function preload() {
    railroad = loadImage(`${BASE_URL}/railroad-straight.png`);

    for (let t of imageUrls) {
        const image = loadImage(`${BASE_URL}/${t}`);
        train.push(image);
    }
}

function setup() {
    createCanvas(800, 550);

    trains = parseTracks(TRACKS);
}

function draw() {
    background("#f0f0f0");

    scale(0.5, 0.5);

    translate(850, -100);

    for (const track of trains) {
        for (let i = 0; i < 5; i++) {
            drawRailroad(i);
        }

        let ix = 0;
        for (const wagon of track) {
            drawTrainWagon(wagon, ix);
            ix++;
        }

        translate(125, 100);
    }
}

function parseTracks(tracksString: string): p5.Image[][] {
    const result: p5.Image[][] = [];

    let track = "";
    for (let i = 0; i < tracksString.length; i++) {
        if (tracksString[i] === ";") {
            result.push(parseTrain(track));
            track = "";
        } else {
            track += tracksString[i];
        }
    }

    result.push(parseTrain(track));
    return result;

}

function parseTrain(trainString: string): p5.Image[] {
    const result: p5.Image[] = [];

    let wagon = "";
    for (let i = 0; i < trainString.length; i++) {
        if (trainString[i] === ",") {
            result.push(train[getWagonIndex(wagon)]);
            wagon = "";
        } else {
            wagon += trainString[i];
        }
    }

    result.push(train[getWagonIndex(wagon)]);
    return result.reverse();
}

function getWagonIndex(wagonAbbreviation: string): number {
    for (let i = 0; i < abbreviations.length; i++) {
        if (wagonAbbreviation === abbreviations[i]) {
            return i;
        }
    }

    // This should NEVER happen!
    return -1;
}

/** Draw a railroad segment */
function drawRailroad(ix: number) {
    image(railroad, -RAILROAD_WIDTH * ix, RAILROAD_HEIGHT * ix, railroad.width, railroad.height);

}

/** Draw a train wagon */
function drawTrainWagon(wagon: p5.Image, ix: number) {
    image(wagon, -WAGON_WIDTH * ix, WAGON_HEIGHT * ix, wagon.width, wagon.height);
}