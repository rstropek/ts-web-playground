const RAILROAD_WIDTH: number = 225;
const RAILROAD_HEIGHT: number = 160;

const WAGON_WIDTH: number = 160;
const WAGON_HEIGHT: number = 113;

let railroad: p5.Image;
const trainCars: p5.Image[] = [];
let trains: p5.Image[][] = [];

/** Input text for base requirements */
const TRAIN: string = "TLB,TCCG,TCTL,TCW,TCL,TCCR";

/** Input text for ADVANCED requirements */
const TRACKS: string = "TLB,TCCG,TCTL,TCW,TCL,TCCR;TEDA,TEDB,TEDB,TEDC,TEDB;TDA,TCF,TCC,TCC,TCB,TCD";

async function setup(): Promise<void> {
    railroad = await loadImage(`${BASE_URL}/railroad-straight.png`);

    // Load the image of every wagon, one after the other.
    for (const imageUrl of imageUrls) {
        const wagonImage: p5.Image = await loadImage(`${BASE_URL}/${imageUrl}`);
        trainCars.push(wagonImage);
    }

    createCanvas(800, 550);

    trains = parseTracks(TRACKS);
}

function draw(): void {
    background("#f0f0f0");

    scale(0.5, 0.5);

    translate(850, -100);

    for (const track of trains) {
        for (let i: number = 0; i < 5; i++) {
            drawRailroad(i);
        }

        let ix: number = 0;
        for (const wagon of track) {
            drawTrainWagon(wagon, ix);
            ix++;
        }

        translate(125, 100);
    }
}

function parseTracks(tracksString: string): p5.Image[][] {
    const result: p5.Image[][] = [];

    let track: string = "";
    for (let i: number = 0; i < tracksString.length; i++) {
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

    let wagon: string = "";
    for (let i: number = 0; i < trainString.length; i++) {
        if (trainString[i] === ",") {
            result.push(trainCars[getWagonIndex(wagon)]);
            wagon = "";
        } else {
            wagon += trainString[i];
        }
    }

    result.push(trainCars[getWagonIndex(wagon)]);

    // The wagons are drawn from right to left. Therefore the first wagon of the
    // string (the locomotive) must end up LAST in the array so that it is drawn
    // at the front of the train.
    return result.reverse();
}

function getWagonIndex(wagonAbbreviation: string): number {
    for (let i: number = 0; i < abbreviations.length; i++) {
        if (wagonAbbreviation === abbreviations[i]) {
            return i;
        }
    }

    // This should NEVER happen!
    return -1;
}

/** Draw a railroad segment */
function drawRailroad(ix: number): void {
    image(railroad, -RAILROAD_WIDTH * ix, RAILROAD_HEIGHT * ix, railroad.width, railroad.height);
}

/** Draw a train wagon */
function drawTrainWagon(wagon: p5.Image, ix: number): void {
    image(wagon, -WAGON_WIDTH * ix, WAGON_HEIGHT * ix, wagon.width, wagon.height);
}
