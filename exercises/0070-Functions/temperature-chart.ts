const AVG_TEMP_LINZ: number[] = [
    -0.7, 0.5, 4.7, 9.9, 14.2, 17.9, 19.5, 19.3, 14.7, 10, 4.8, 0.6,
  ];
  
  const AVG_TEMP_JOHANNESBURG: number[] = [
    20, 20, 18, 15, 12, 9, 9, 12, 16, 18, 18, 19,
  ];
  
  function setup() {
    createCanvas(460, 300);
    drawTemperatures(AVG_TEMP_JOHANNESBURG);
    drawAxes();
    drawYLabels();
    drawXLabels();
  }
  
  function drawAxes() {
    push();
    stroke("black");
    strokeWeight(2);
  
    line(50, 50, 50, 250);
    line(50, 225, 410, 225);
    pop();
  }
  
  function drawYLabels() {
    push();
    textAlign(RIGHT, CENTER);
    textSize(10);
    strokeWeight(2);
    for (let t = -5; t <= 35; t += 5) {
      let y = 225 - t * 5;
  
      push();
      stroke("black");
      line(45, y, 55, y);
      pop();
  
      push();
      noStroke();
      fill("black");
      text(t, 40, y);
      pop();
    }
  
    pop();
  }
  
  function drawXLabels() {
    push();
    strokeWeight(2);
    textAlign(CENTER, BOTTOM);
    textSize(8);
    for (let i = 1; i <= 12; i++) {
      let x = 50 + i * 30;
  
      push();
      stroke("black");
      line(x, 220, x, 230);
      pop();
  
      push();
      noStroke();
      fill("black");
  
      let month = "";
      switch (i) {
        case 1:
          month = "Jan";
          break;
        case 2:
          month = "Feb";
          break;
        case 3:
          month = "Mar";
          break;
        case 4:
          month = "Apr";
          break;
        case 5:
          month = "May";
          break;
        case 6:
          month = "Jun";
          break;
        case 7:
          month = "Jul";
          break;
        case 8:
          month = "Aug";
          break;
        case 9:
          month = "Sep";
          break;
        case 10:
          month = "Oct";
          break;
        case 11:
          month = "Nov";
          break;
        case 12:
          month = "Dec";
          break;
      }
  
      text(month, x - 30, 180, 30, 40);
      pop();
    }
  
    pop();
  }
  
  function drawTemperatures(temperatures: number[]) {
    push();
    noStroke();
    fill("gold");
    for (let i = 0; i < temperatures.length; i++) {
      let x = 50 + i * 30;
      let y = 225 - temperatures[i] * 5;
      rect(x + 5, y, 20, temperatures[i] * 5);
    }
  }
  