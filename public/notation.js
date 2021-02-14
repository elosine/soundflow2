// <editor-fold> <<<< GLOBAL VARIABLES >>>> -------------------------------- //
// CLOCK -------------------------- >
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
var startTime;
var clockTimeMS, clockTimeSec, clockTimeMin, clockTimeHrs;
// TIMING ------------------------- >
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var timeAdjustment = 0;
// SVG ---------------------------- >
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
// NOTATION SVGs ------------------ >
var numDials = 4;
var dials = [];
//// DIAL Notation Data ////////////////////////////////////
//[url, w, h]
var notationUrlsDimensions = [];
var motiveWeightingSets = [
  [0.13, 0.13, 0.13, 0.13, 0.42],
  [0.15, 0.3, 0.18, 0.28, 0.31],
  [0.23, 0.07, 0.2, 0.11, 0.22],
  [0.2, 0.22, 0.2, 0.11, 0.11]
];
var numTicksPerDial = [12, 11, 13, 9];
var useNotationProbabilities = [0.36, 0.42, 0.33, 0.41];
var bpms = [87, 87.045, 87.091, 87.1346];
for (var i = 0; i < numDials; i++) notationUrlsDimensions.push([]);
// 4 dials
var motivePaths = [
  [
    "/notation/eight_accent_2ndPartial_27_34.svg",
    "/notation/eight_accent_1stPartial_27_34.svg",
    "/notation/triplet_accent_1st_partial_45_45.svg",
    "/notation/quarter_accent_12_35.svg",
    "/notation/quadruplet_accent.svg"
  ],
  [
    "/notation/eight_accent_2ndPartial_27_34.svg",
    "/notation/eight_accent_1stPartial_27_34.svg",
    "/notation/triplet_accent_1st_partial_45_45.svg",
    "/notation/quarter_accent_12_35.svg",
    "/notation/quadruplet_accent.svg"
  ],
  [
    "/notation/eight_accent_2ndPartial_27_34.svg",
    "/notation/eight_accent_1stPartial_27_34.svg",
    "/notation/triplet_accent_1st_partial_45_45.svg",
    "/notation/quarter_accent_12_35.svg",
    "/notation/quadruplet_accent.svg"
  ],
  [
    "/notation/eight_accent_2ndPartial_27_34.svg",
    "/notation/eight_accent_1stPartial_27_34.svg",
    "/notation/triplet_accent_1st_partial_45_45.svg",
    "/notation/quarter_accent_12_35.svg",
    "/notation/quadruplet_accent.svg"
  ]
];

// one dial
// var motivePaths = [
//   [
//     "/notation/quintuplet_accent.svg",
//     "/notation/eight_accent_2ndPartial_27_34.svg",
//     "/notation/eight_accent_1stPartial_27_34.svg",
//     "/notation/triplet_accent_1st_partial_45_45.svg",
//     "/notation/quarter_accent_12_35.svg",
//     "/notation/quadruplet_accent.svg"
//   ]
// ];
// two dials
// var motivePaths = [
//   [
//     "/notation/quintuplet_accent.svg",
//     "/notation/eight_accent_2ndPartial_27_34.svg",
//     "/notation/eight_accent_1stPartial_27_34.svg",
//     "/notation/triplet_accent_1st_partial_45_45.svg",
//     "/notation/quarter_accent_12_35.svg"
//   ],
//   [
//     "/notation/quadruplet_accent.svg",
//     "/notation/eight_accent_2ndPartial_27_34.svg",
//     "/notation/eight_accent_1stPartial_27_34.svg",
//     "/notation/triplet_accent_1st_partial_45_45.svg",
//     "/notation/quarter_accent_12_35.svg"
//   ]
// ];

// CONTROL PANEL ------------------ >
var controlPanel;
// BUTTONS ------------------------ >
var activateButtons = false;
var activateStartBtn = false;
var activatePauseStopBtn = false;
var activateSaveBtn = false;
// START -------------------------- >
var startPieceGate = true;
var pauseState = 0;
var pausedTime = 0;
var animationGo = true;
// SIZE --------------------------- >
var dialW = 360;
var dialH = 360;
// </editor-fold> END GLOBAL VARIABLES ////////////////////////////////////////


// <editor-fold> <<<< START UP SEQUENCE >>>> ------------------------------- //
//mkCtrlPanel()
//getImgDimensions() => makeDials()
// INIT --------------------------------------------------- //
function init() { //run from html onload='init();'
  // 01: MAKE CONTROL PANEL ---------------- >
  controlPanel = mkCtrlPanel("ctrlPanel", dialW, ctrlPanelH, "Control Panel");
  // 02: GET NOTATION SIZES ---------------- >
  //need a motivePaths entry for every dial
  getImgDimensions(motivePaths, notationUrlsDimensions);
}
// TIMESYNC ENGINE ---------------------------------------- //
var tsServer;
if (window.location.hostname == 'localhost') {
  tsServer = '/timesync';
} else {
  tsServer = window.location.hostname + '/timesync';
}
var ts = timesync.create({
  // server: tsServer,
  server: '/timesync',
  interval: 1000
});
// 03: GENERATE STATIC ELEMENTS ---------------- >
function makeDials() {
  for (var i = 0; i < numDials; i++) {
    dials.push(mkDialNO(i, dialW, dialH, numTicksPerDial[i], bpms[i], notationUrlsDimensions[i], useNotationProbabilities[i], motiveWeightingSets[i]));
  }
}
// FUNCTION: startClockSync ------------------------------- //
function startClockSync() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
  startTime = lastFrameTimeMs;
}
// FUNCTION: startPiece ----------------------------------- //
function startPiece() {
  startClockSync();
  requestAnimationFrame(animationEngine); //change to gate
}

// </editor-fold> END START UP SEQUENCE ///////////////////////////////////////


// <editor-fold> <<<< DIAL NOTATION OBJECT >>>> ---------------------------- //

// <editor-fold>        <<<< DIAL NOTATION OBJECT - INIT >>>> -- //
function mkDialNO(ix, w, h, numTicks, ibpm, motiveUrlSzSet, useNotationProbability, motiveWeightingSet) {
  var notationObj = {}; //returned object to add all elements and data
  var cx = w / 2;
  var cy = h / 2;
  var innerRadius = 70;
  var tickLength = 11;
  var tickWidth = 1;
  var noteSpace = 70;
  var midRadius = innerRadius + noteSpace;
  var bbRadius = 10;
  var bbLandLineY = cy + innerRadius - 20;
  var bbImpactY = bbLandLineY - bbRadius;
  var bbDescentLengthFrames = 13;
  var bbDescentLengthPx = (bbDescentLengthFrames * (bbDescentLengthFrames + 1)) / 2;
  var bbStartY = bbImpactY - bbDescentLengthPx; // 78 accomodates acceleration 1+2+3+4...12
  var bbLandLineR = 10;
  var bbLandLineX1 = cx - bbLandLineR;
  var bbLandLineX2 = cx + bbLandLineR;
  var bbOffFrame = 0;
  var bbDurFrames = 18;
  var bbVelocity = 1;
  var bbAccel = 1;
  // var bbDescentLength = bbImpactY - bbStartY; //80 velocity has to into this whole
  var bbLeadTime;
  var bbDir = 1;
  var defaultStrokeWidth = 4;
  var outerRadius = w / 2;
  var tickBlinkTimes = []; //timer to blink ticks
  var notes = [];
  var noteBoxes = [];
  var tickDegs = [];
  for (var i = 0; i < numTicks; i++) tickBlinkTimes.push(0); //populate w/0s
  // Calculate number of degrees per frame
  var beatsPerSec = ibpm / 60;
  var beatsPerFrame = beatsPerSec / FRAMERATE;
  var degreesPerBeat = 360 / numTicks;
  var degreesPerFrame = degreesPerBeat * beatsPerFrame;
  var framesPerBeat = 1.0 / beatsPerFrame;
  var initDeg = 270 - (5 * degreesPerBeat);
  var currDeg = initDeg;
  var lastDeg = currDeg;
  // 100 beats trial
  var bbBeatFrames = [];
  for (var i = 0; i < 3000; i++) {
    bbBeatFrames.push(Math.round(i * framesPerBeat) - bbDescentLengthFrames);
  }
  notationObj['newTempoFunc'] =
    function newTempo(newBPM) {
      var newBeatsPerSec = newBPM / 60;
      var newBeatsPerFrame = newBeatsPerSec / FRAMERATE;
      degreesPerFrame = degreesPerBeat * newBeatsPerFrame;
    }
  // Generate ID
  var id = 'dial' + ix;
  notationObj['id'] = id;
  // Make SVG Canvas ------------- >
  var canvasID = id + 'canvas';
  var svgCanvas = mkSVGcanvas(canvasID, w, h); //see func below
  notationObj['canvas'] = svgCanvas;
  // Make jsPanel ----------------- >
  var panelID = id + 'panel';
  var panel = mkPanel(panelID, svgCanvas, w, h, "Player " + ix.toString()); //see func below
  notationObj['panel'] = panel;
  // </editor-fold>       END DIAL NOTATION OBJECT - INIT /////////

  // <editor-fold>      <<<< DIAL NOTATION OBJECT - STATIC ELEMENTS //
  //// Ring -------------------------------- //
  var ring = document.createElementNS(SVG_NS, "circle");
  ring.setAttributeNS(null, "cx", cx);
  ring.setAttributeNS(null, "cy", cy);
  ring.setAttributeNS(null, "r", innerRadius);
  ring.setAttributeNS(null, "stroke", "rgb(153, 255, 0)");
  ring.setAttributeNS(null, "stroke-width", defaultStrokeWidth);
  ring.setAttributeNS(null, "fill", "none");
  var ringID = id + 'ring';
  ring.setAttributeNS(null, "id", ringID);
  svgCanvas.appendChild(ring);
  notationObj['ring'] = ring;
  //// Dial ------------------------------- //
  var dialWidth = 1;
  var dial = document.createElementNS(SVG_NS, "line");
  var ogx1 = outerRadius * Math.cos(rads(initDeg)) + cx;
  var ogy1 = outerRadius * Math.sin(rads(initDeg)) + cy;
  dial.setAttributeNS(null, "x1", ogx1);
  dial.setAttributeNS(null, "y1", ogy1);
  dial.setAttributeNS(null, "x2", cx);
  dial.setAttributeNS(null, "y2", cy);
  dial.setAttributeNS(null, "stroke", "rgb(153,255,0)");
  dial.setAttributeNS(null, "stroke-width", dialWidth);
  var dialID = id + 'dial';
  dial.setAttributeNS(null, "id", dialID);
  svgCanvas.appendChild(dial);
  notationObj['dial'] = dial;
  //// Ticks ------------------------------- //
  var ticks = [];
  var tickRadius = innerRadius - (defaultStrokeWidth / 2) - 3; // ticks offset from dial 3px like a watch
  for (var i = 0; i < numTicks; i++) {
    var tickDeg = -90 + (degreesPerBeat * i); //-90 is 12 o'clock
    tickDegs.push(tickDeg); //store degrees for collision detection later
    var x1 = midRadius * Math.cos(rads(tickDeg)) + cx;
    var y1 = midRadius * Math.sin(rads(tickDeg)) + cy;
    var x2 = (tickRadius - tickLength) * Math.cos(rads(tickDeg)) + cx;
    var y2 = (tickRadius - tickLength) * Math.sin(rads(tickDeg)) + cy;
    var tick = document.createElementNS(SVG_NS, "line");
    tick.setAttributeNS(null, "x1", x1);
    tick.setAttributeNS(null, "y1", y1);
    tick.setAttributeNS(null, "x2", x2);
    tick.setAttributeNS(null, "y2", y2);
    tick.setAttributeNS(null, "stroke", "rgb(255,128,0)");
    tick.setAttributeNS(null, "stroke-width", tickWidth);
    var tickID = id + 'tick' + i;
    tick.setAttributeNS(null, "id", tickID);
    svgCanvas.appendChild(tick);
    ticks.push(tick);
  }
  notationObj['ticks'] = ticks;
  //// Bouncing Ball ------------------------------- //
  //bb landing line
  var bbLandLineWidth = 2;
  var bbLandLine = document.createElementNS(SVG_NS, "line");
  bbLandLine.setAttributeNS(null, "x1", bbLandLineX1);
  bbLandLine.setAttributeNS(null, "y1", bbLandLineY);
  bbLandLine.setAttributeNS(null, "x2", bbLandLineX2);
  bbLandLine.setAttributeNS(null, "y2", bbLandLineY);
  bbLandLine.setAttributeNS(null, "stroke", "rgb(153,255,0)");
  bbLandLine.setAttributeNS(null, "stroke-width", bbLandLineWidth);
  var bbLandLineID = id + 'bbLandLine';
  bbLandLine.setAttributeNS(null, "id", bbLandLineID);
  svgCanvas.appendChild(bbLandLine);
  notationObj['bbLandLine'] = bbLandLine;
  //Create array of 4 balls
  //Only visible x amount of time before
  //bb landing line
  var bb = document.createElementNS(SVG_NS, "circle");
  bb.setAttributeNS(null, "cx", cx);
  bb.setAttributeNS(null, "cy", bbStartY);
  bb.setAttributeNS(null, "r", bbRadius); //set bb radius
  bb.setAttributeNS(null, "stroke", "none");
  bb.setAttributeNS(null, "fill", "rgb(153, 255, 0)");
  var bbID = id + 'bb';
  bb.setAttributeNS(null, "id", bbID);
  bb.setAttributeNS(null, 'visibility', 'hidden');
  svgCanvas.appendChild(bb);
  notationObj['bouncingBall'] = bb;
  // </editor-fold>     END DIAL NOTATION OBJECT - STATIC ELEMENTS //

  // <editor-fold>      <<<< DIAL NOTATION OBJECT - GENERATE PIECE //
  var rectSize = 36;
  notationObj['generateNotesArr'] = function() {
    // FUNCTION GENERATE PIECE ALGORITHIM ----------------------------------- //
    var notesArr = [];
    for (var i = 0; i < tickDegs.length; i++) {
      var useNotation = probability(useNotationProbability); //set porbability of any given tick having a notation
      // if this tick has notation, algorithm for choosing the motive for this tick
      if (useNotation) {
        //Universalize this based on array of motives
        var motivesIxSet = [];
        // Generate numbers 0-size of set for chooseWeighted algo below
        motiveUrlSzSet.forEach(function(it, ix) {
          motivesIxSet.push(ix);
        });
        var chosenMotiveIx = chooseWeighted(motivesIxSet, motiveWeightingSet);
        var chosenMotive = motiveUrlSzSet[chosenMotiveIx];
        notesArr.push(chosenMotive);
      } else { //not all ticks have a notation box. push 0 to empty ones
        notesArr.push(-1);
      }
    }
    notationObj['notesArr'] = notesArr;
    return notesArr;
  }
  // </editor-fold>     END DIAL NOTATION OBJECT - GENERATE PIECE

  // <editor-fold>      <<<< DIAL NOTATION OBJECT - GENERATE NOTATION >>>> //
  notationObj['generateNotation'] = function(notesArr) {
    //Remove Previous Notation
    notes.forEach(function(it, ix) {
      if (it != 0) {
        it.parentNode.removeChild(it);
      }
    });
    noteBoxes.forEach(function(it, ix) {
      if (it != 0) {
        it.parentNode.removeChild(it);
      }
    });
    notes = [];
    noteBoxes = [];
    // Generate New Notation and Boxes
    for (var i = 0; i < notesArr.length; i++) {
      if (notesArr[i] != -1) {
        var url = notesArr[i][0];
        var svgW = notesArr[i][1];
        var svgH = notesArr[i][2];
        var deg = notesArr[i][3];
        var notationSVG = document.createElementNS(SVG_NS, "image");
        notationSVG.setAttributeNS(SVG_XLINK, 'xlink:href', url);
        var rectx = midRadius * Math.cos(rads(tickDegs[i])) + cx - (svgW / 2);
        var recty = midRadius * Math.sin(rads(tickDegs[i])) + cy - (svgH / 2);
        notationSVG.setAttributeNS(null, "transform", "translate( " + rectx.toString() + "," + recty.toString() + ")");
        var notationSVGID = id + 'notationSVG' + i;
        notationSVG.setAttributeNS(null, "id", notationSVGID);
        notationSVG.setAttributeNS(null, 'visibility', 'visible');
        notes.push(notationSVG);
        var noteBox = document.createElementNS(SVG_NS, "rect");
        noteBox.setAttributeNS(null, "width", svgW + 6);
        noteBox.setAttributeNS(null, "height", svgH + 6);
        var boxX = rectx - 3;
        var boxY = recty - 3;
        noteBox.setAttributeNS(null, "transform", "translate( " + boxX.toString() + "," + boxY.toString() + ")");
        var noteBoxID = id + 'noteBox' + i;
        noteBox.setAttributeNS(null, "id", canvasID);
        noteBox.setAttributeNS(null, 'visibility', 'visible');
        noteBox.setAttributeNS(null, "fill", "white");
        noteBoxes.push(noteBox);
        svgCanvas.appendChild(noteBox);
        svgCanvas.appendChild(notationSVG);
      } else { //not all ticks have a notation box. push 0 to empty ones
        notes.push(0);
        noteBoxes.push(0);
      }
    }
  }
  // </editor-fold>     END DIAL NOTATION OBJECT - GENERATE NOTATION

  // <editor-fold>      <<<< DIAL NOTATION OBJECT - ANIMATION >>>> //
  var tickBlinkDur = 30;
  var growTickLen = 12; //expand tick stroke-width by this amount
  // ---------------------------------------------------------- >
  var animateFunc = function(time) {
    // Animate Dial
    currDeg += degreesPerFrame; //advance degreesPerFrame
    var newDialX1 = outerRadius * Math.cos(rads(currDeg)) + cx;
    var newDialY1 = outerRadius * Math.sin(rads(currDeg)) + cy;
    dial.setAttributeNS(null, "x1", newDialX1);
    dial.setAttributeNS(null, "y1", newDialY1);
    // Animate Ticks
    var currDegMod = ((currDeg + 90) % 360) - 90; //do this hack so you are not mod negative number
    tickDegs.forEach(function(it, ix) {
      if (ix == 0) { //for tick at 12o'clock to accomodate for positive to negative transition
        if (lastDeg > 0 && currDegMod < 0) { //if last frame was pos and this frame neg
          ticks[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
          ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
          tickBlinkTimes[ix] = (time + tickBlinkDur); //set blink timer time for this tick
          // Note Boxes
          if (noteBoxes[ix] != 0) {
            noteBoxes[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
            noteBoxes[ix].setAttributeNS(null, "stroke-width", 4);
          }
        }
      } else {
        if (currDeg < 270) { // different color for count in
          if (it > lastDeg && it <= currDegMod) { //all other ticks looking to see that last frame dial was before this tick and in this frame dial is equal or past this tick
            ticks[ix].setAttributeNS(null, "stroke", "rgb(153,255,0)");
            ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
            tickBlinkTimes[ix] = (time + tickBlinkDur); //set blink timer time for this tick
          }
        } else {
          if (it > lastDeg && it <= currDegMod) { //all other ticks looking to see that last frame dial was before this tick and in this frame dial is equal or past this tick
            ticks[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
            ticks[ix].setAttributeNS(null, "stroke-width", tickWidth + growTickLen);
            tickBlinkTimes[ix] = (time + tickBlinkDur); //set blink timer time for this tick
            // Note Boxes
            if (noteBoxes[ix] != 0) {
              noteBoxes[ix].setAttributeNS(null, "stroke", "rgb(255,0,0)");
              noteBoxes[ix].setAttributeNS(null, "stroke-width", 4);
            }
          }
        }
      }
    });
    // Start Bouncing Ball Timer
    for (var k = 0; k < bbBeatFrames.length; k++) {
      if (framect == bbBeatFrames[k]) {
        bbVelocity = 1;
        bbAccel = 1;
        bb.setAttributeNS(null, 'cy', bbStartY)
        bbOffFrame = framect + bbDurFrames;
        bbDir = 1;
        break;
      }
    }
    lastDeg = currDegMod;
    // Tick blink timer
    tickBlinkTimes.forEach(function(it, ix) {
      if (time > it) {
        ticks[ix].setAttributeNS(null, "stroke", "rgb(255,128,0)");
        ticks[ix].setAttributeNS(null, "stroke-width", tickWidth);
        // Note Boxes
        if (noteBoxes[ix] != 0) {
          noteBoxes[ix].setAttributeNS(null, "stroke", "white");
          noteBoxes[ix].setAttributeNS(null, "stroke-width", 0);
        }
      }
    })
    // Bouncing Ball Animation
    if (framect < bbOffFrame) {
      bb.setAttributeNS(null, 'visibility', 'visible');
      var bbCurrentY = parseInt(bb.getAttributeNS(null, 'cy'));
      bbVelocity = bbVelocity + bbAccel;
      var bbNewY = bbCurrentY + (bbVelocity * bbDir);
      if (bbNewY > bbImpactY) {
        bbDir = -1;
        bbVelocity = 10;
        bbAccel = -1;
      }
      bb.setAttributeNS(null, 'cy', bbNewY)
    } else {
      bb.setAttributeNS(null, 'visibility', 'hidden');
    }
  }
  notationObj['animateFunc'] = animateFunc;
  return notationObj;
}
// </editor-fold>     END DIAL NOTATION OBJECT - ANIMATION ///////

// </editor-fold> END DIAL NOTATION OBJECT ////////////////////////////////////


// <editor-fold> <<<< CONTROL PANEL >>>> ----------------------------------- //

// <editor-fold>       <<<< CONTROL PANEL - INIT >>>> ----------- //
var ctrlPanelH = 70;

function mkCtrlPanel(panelid, w, h, title) {
  var tpanel;
  //Container Div
  var ctrlPanelDiv = document.createElement("div");
  ctrlPanelDiv.style.width = w.toString() + "px";
  ctrlPanelDiv.style.height = h.toString() + "px";
  ctrlPanelDiv.setAttribute("id", "ctrlPanel");
  ctrlPanelDiv.style.backgroundColor = "black";
  var btnW = 44;
  var btnH = 44;
  var btnHstr = btnH.toString() + "px";
  var btnSpace = btnW + 6;
  // </editor-fold>       END CONTROL PANEL - INIT ////-----////////

  // <editor-fold>     <<<< CONTROL PANEL - GENERATE PIECE >>>> - //
  var generateNotationButton = document.createElement("BUTTON");
  generateNotationButton.id = 'generateNotationButton';
  generateNotationButton.innerText = 'Make Piece';
  generateNotationButton.className = 'btn btn-1';
  generateNotationButton.style.width = btnW.toString() + "px";
  generateNotationButton.style.height = btnHstr;
  generateNotationButton.style.top = "0px";
  generateNotationButton.style.left = "0px";
  generateNotationButton.addEventListener("click", function() {
    if (activateButtons) {
      var newNotationArr = [];
      dials.forEach((it, ix) => {
        newNotationArr.push(it.generateNotesArr());
      });
      socket.emit('createEvents', {
        eventDataArr: newNotationArr
      });
    }
  });
  ctrlPanelDiv.appendChild(generateNotationButton);
  // </editor-fold>       END CONTROL PANEL - GENERATE PIECE //////

  // <editor-fold>     <<<< CONTROL PANEL - LOAD PIECE >>>> ----- //
  var loadPieceBtn = document.createElement("BUTTON");
  loadPieceBtn.id = 'loadPieceBtn';
  loadPieceBtn.innerText = 'Load Piece';
  loadPieceBtn.className = 'btn btn-1';
  loadPieceBtn.style.width = btnW.toString() + "px";
  loadPieceBtn.style.height = btnHstr;
  loadPieceBtn.style.top = "0px";
  var tSpace = btnSpace;
  tSpace = tSpace.toString() + "px";
  loadPieceBtn.style.left = tSpace;
  loadPieceBtn.addEventListener("click", function() {
    if (activateButtons) {
      // UPLOAD pitchChanges from file ----------------------- //
      var input = document.createElement('input');
      input.type = 'file';
      input.onchange = e => {
        var reader = new FileReader();
        reader.readAsText(e.srcElement.files[0]);
        var me = this;
        reader.onload = function() {

          var dataAsText = reader.result;
          var eventsArray = [];
          var playersArr = dataAsText.split("newPlayerDataSet");
          playersArr.forEach(function(it, ix) {
            var t1 = it.split(";");
            var thisPlayersEvents = [];
            for (var i = 0; i < t1.length; i++) {
              if (t1[i] == -1) {
                thisPlayersEvents.push(-1);
              } else {
                t2 = [];
                var temparr = t1[i].split(',');
                t2.push(temparr[0]);
                t2.push(parseInt(temparr[1]));
                t2.push(parseInt(temparr[2]));
                thisPlayersEvents.push(t2);
              }
            }
            eventsArray.push(thisPlayersEvents);
          })
          socket.emit('loadPiece', {
            eventsArray: eventsArray
          });

        }
      }
      input.click();
    }
  });
  ctrlPanelDiv.appendChild(loadPieceBtn);
  // </editor-fold>       END CONTROL PANEL - LOAD PIECE //////////

  // <editor-fold>     <<<< CONTROL PANEL - START >>>> ---------- //
  var startBtn = document.createElement("BUTTON");
  startBtn.id = 'startBtn';
  startBtn.innerText = 'Start';
  startBtn.className = 'btn btn-1_inactive';
  startBtn.style.width = btnW.toString() + "px";
  startBtn.style.height = btnHstr;
  startBtn.style.top = "0px";
  var tSpace = btnSpace * 2;
  tSpace = tSpace.toString() + "px";
  startBtn.style.left = tSpace;
  startBtn.addEventListener("click", function() {
    if (activateButtons) {
      if (activateStartBtn) {
        socket.emit('startpiece', {});
      }
    }
  });
  ctrlPanelDiv.appendChild(startBtn);
  // </editor-fold>    END CONTROL PANEL - START ///////////////////

  // <editor-fold>     <<<< CONTROL PANEL - PAUSE >>>> ---------- //
  var pauseBtn = document.createElement("BUTTON");
  pauseBtn.id = 'pauseBtn';
  pauseBtn.innerText = 'Pause';
  pauseBtn.className = 'btn btn-1_inactive';
  pauseBtn.style.width = btnW.toString() + "px";
  pauseBtn.style.height = btnHstr;
  pauseBtn.style.top = "0px";
  var tSpace = btnSpace * 3;
  tSpace = tSpace.toString() + "px";
  pauseBtn.style.left = tSpace;
  pauseBtn.addEventListener("click", function() {
    if (activateButtons) {
      if (activatePauseStopBtn) {
        pauseState = (pauseState + 1) % 2;
        var t_now = new Date(ts.now());
        var pauseTime = t_now.getTime()
        if (pauseState == 1) { //Paused
          socket.emit('pause', {
            pauseState: pauseState,
            pauseTime: pauseTime
          });
        } else if (pauseState == 0) { //unpaused
          var globalPauseTime = pauseTime - pausedTime;
          socket.emit('pause', {
            pauseState: pauseState,
            pauseTime: globalPauseTime
          });
        }
      }
    }
  });
  ctrlPanelDiv.appendChild(pauseBtn);
  // </editor-fold>    END CONTROL PANEL - PAUSE ///////////////////

  // <editor-fold>     <<<< CONTROL PANEL - STOP >>>> ----------- //
  var stopBtn = document.createElement("BUTTON");
  stopBtn.id = 'stopBtn';
  stopBtn.innerText = 'Stop';
  stopBtn.className = 'btn btn-1_inactive';
  stopBtn.style.width = btnW.toString() + "px";
  stopBtn.style.height = btnHstr;
  stopBtn.style.top = "0px";
  var tSpace = btnSpace * 4;
  tSpace = tSpace.toString() + "px";
  stopBtn.style.left = tSpace;
  stopBtn.addEventListener("click", function() {
    if (activateButtons) {
      if (activatePauseStopBtn) {
        socket.emit('stop', {});
      }
    }
  });
  ctrlPanelDiv.appendChild(stopBtn);
  // </editor-fold>    END CONTROL PANEL - STOP ////////////////////

  // <editor-fold>     <<<< CONTROL PANEL - SAVE >>>> ----------- //
  var saveBtn = document.createElement("BUTTON");
  saveBtn.id = 'saveBtn';
  saveBtn.innerText = 'Save';
  saveBtn.className = 'btn btn-1_inactive';
  saveBtn.style.width = btnW.toString() + "px";
  saveBtn.style.height = btnHstr;
  saveBtn.style.top = "0px";
  var tSpace = btnSpace * 5;
  tSpace = tSpace.toString() + "px";
  saveBtn.style.left = tSpace;
  saveBtn.addEventListener("click", function() {
    if (activateButtons) {
      if (activateSaveBtn) {
        var eventDataStr = "";
        dials.forEach(function(it, ix) {
          var eventData = it.notesArr;
          for (var i = 0; i < eventData.length; i++) {
            if (i != (eventData.length - 1)) { //if not last (last item will not have semicolon)
              if (eventData[i] == -1) { // -1 means no notation for this tick
                eventDataStr = eventDataStr + "-1;";
              } else { // if it has notation
                for (var j = 0; j < eventData[i].length; j++) {
                  if (j == (eventData[i].length - 1)) {
                    eventDataStr = eventDataStr + eventData[i][j].toString() + ";"; //semicolon for last one
                  } else {
                    eventDataStr = eventDataStr + eventData[i][j].toString() + ","; // , for all others
                  }
                }
              }
            } else { //last one don't include semicolon
              if (eventData[i] == -1) {
                eventDataStr = eventDataStr + "-1";
              } else {
                for (var j = 0; j < eventData[i].length; j++) {
                  if (j == (eventData[i].length - 1)) {
                    eventDataStr = eventDataStr + eventData[i][j].toString();
                  } else {
                    eventDataStr = eventDataStr + eventData[i][j].toString() + ",";
                  }
                }
              }
              if (ix != (dials.length - 1)) {
                eventDataStr = eventDataStr + "newPlayerDataSet"; //Mark start of new notation set for next player
              }
            }
          }

        });
        var t_now = new Date(ts.now());
        var month = t_now.getMonth() + 1;
        var eventsFileName = "pulseCycle003_" + t_now.getFullYear() + "_" + month + "_" + t_now.getUTCDate() + "_" + t_now.getHours() + "-" + t_now.getMinutes();
        downloadStrToHD(eventDataStr, eventsFileName, 'text/plain');
      }
    }
  });
  ctrlPanelDiv.appendChild(saveBtn);
  // </editor-fold>    END CONTROL PANEL - SAVE ////////////////////

  // <editor-fold>     <<<< CONTROL PANEL - TEMPO >>>> ---------- //
  var tempoInputField = document.createElement("input");
  tempoInputField.type = 'text';
  tempoInputField.className = 'input__field--yoshiko';
  tempoInputField.id = 'tempoInputField';
  // tempoInputField.value = bpm;
  var inputW = (btnW - 15).toString() + "px";
  tempoInputField.style.width = inputW;
  var inputH = (btnH - 42).toString() + "px";
  tempoInputField.style.height = inputH;
  tempoInputField.style.top = "-4px";
  var tSpace = (btnSpace * 6) - 3;
  tSpace = tSpace.toString() + "px";
  tempoInputField.style.left = tSpace;
  tempoInputField.addEventListener("click", function() {
    tempoInputField.focus();
    tempoInputField.select();
  });
  tempoInputField.addEventListener("keyup", function(e) {
    if (e.keyCode === 13) {
      if (activateButtons) {
        socket.emit('newTempo', {
          newTempo: tempoInputField.value
        });
      }
    }
  });
  ctrlPanelDiv.appendChild(tempoInputField);
  // TEMPO INPUT FIELD Label
  var tempoInputFieldLbl = document.createElement("label");
  tempoInputFieldLbl.for = 'tempoInputField';
  tempoInputFieldLbl.style.left = tSpace;
  tempoInputFieldLbl.style.top = "-8px";
  tempoInputFieldLbl.className = 'input__label input__label--yoshiko';


  // tempoInputFieldLbl.style.color = "#a3d39c";
  tempoInputFieldLbl.innerHTML = "Tempo";
  ctrlPanelDiv.appendChild(tempoInputFieldLbl);
  // </editor-fold>    END CONTROL PANEL - TEMPO ///////////////////

  // <editor-fold>     <<<< CONTROL PANEL - PLAYER # >>>> ------- //
  var playerNumInputField = document.createElement("input");
  playerNumInputField.type = 'text';
  playerNumInputField.className = 'input__field--yoshiko';
  playerNumInputField.id = 'playerNum';
  playerNumInputField.value = 0;
  var inputW = (btnW - 15).toString() + "px";
  playerNumInputField.style.width = inputW;
  var inputH = (btnH - 42).toString() + "px";
  playerNumInputField.style.height = inputH;
  playerNumInputField.style.top = "27px";
  var tSpace = (btnSpace * 6) - 3;
  tSpace = tSpace.toString() + "px";
  playerNumInputField.style.left = tSpace;
  playerNumInputField.addEventListener("click", function() {
    playerNumInputField.focus();
    playerNumInputField.select();
  });
  playerNumInputField.addEventListener("keyup", function(e) {
    if (e.keyCode === 13) {
      if (activateButtons) {
        dials.forEach(function(it, ix) {
          if (ix != parseInt(playerNumInputField.value)) {
            it.panel.smallify();
          } else {
            it.panel.unsmallify();
          }
        })
      }
    }
  });
  ctrlPanelDiv.appendChild(playerNumInputField);
  // TEMPO INPUT FIELD Label
  var playerNumInputFieldLbl = document.createElement("label");
  playerNumInputFieldLbl.for = 'playerNum';
  playerNumInputFieldLbl.style.left = tSpace;
  playerNumInputFieldLbl.style.top = "24px";
  playerNumInputFieldLbl.className = 'input__label input__label--yoshiko';


  // playerNumInputFieldLbl.style.color = "#a3d39c";
  playerNumInputFieldLbl.innerHTML = "Player #";
  ctrlPanelDiv.appendChild(playerNumInputFieldLbl);
  // </editor-fold>    END CONTROL PANEL - PLAYER # ////////////////

  // <editor-fold>     <<<< CONTROL PANEL - jsPanel >>>> -------- //
  // jsPanel
  jsPanel.create({
    position: 'center-bottom',
    id: panelid,
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      // smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    onsmallified: function(panel, status) {
      var headerY = window.innerHeight - 36;
      headerY = headerY.toString() + "px";
      panel.style.top = headerY;
    },
    onunsmallified: function(panel, status) {
      var headerY = window.innerHeight - ctrlPanelH - 34;
      headerY = headerY.toString() + "px";
      panel.style.top = headerY;
    },
    contentOverflow: 'hidden',
    headerTitle: '<small>' + title + '</small>',
    theme: "light",
    content: ctrlPanelDiv,
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {}
    },
    // dragit: {
    //   disable: true
    // },
    callback: function() {
      tpanel = this;
    }
  });
  return tpanel;
}
// </editor-fold>    END CONTROL PANEL - jsPanel ///////////////////

// </editor-fold> END CONTROL PANEL ///////////////////////////////////////////


// <editor-fold>     <<<< CLOCK >>>> --------------------------------------- //

// <editor-fold>       <<<< FUNCTION CALC CLOCK >>>> -------------- //
function calcClock(time) {
  var timeMS = time - startTime;
  clockTimeMS = timeMS % 1000;
  clockTimeSec = Math.floor(timeMS / 1000) % 60;
  clockTimeMin = Math.floor(timeMS / 60000) % 60;
  clockTimeHrs = Math.floor(timeMS / 3600000);
  document.getElementById('clockdiv').innerHTML =
    pad(clockTimeMin, 2) + ":" +
    pad(clockTimeSec, 2)
}
// </editor-fold>      END FUNCTION CALC CLOCK ///////////////////////
// Clock Div
var clockDiv = document.createElement("div");
clockDiv.style.width = "41px";
clockDiv.style.height = "20px";
clockDiv.setAttribute("id", "clockdiv");
clockDiv.style.backgroundColor = "yellow";
// Clock Panel
jsPanel.create({
  position: 'right-top',
  id: "clockPanel",
  contentSize: "41 20",
  header: 'auto-show-hide',
  headerControls: {
    minimize: 'remove',
    // smallify: 'remove',
    maximize: 'remove',
    close: 'remove'
  },
  contentOverflow: 'hidden',
  headerTitle: '<small>' + 'Clock' + '</small>',
  theme: "light",
  content: clockDiv,
  resizeit: {
    aspectRatio: 'content',
    resize: function(panel, paneldata, e) {}
  },
  callback: function() {
    tpanel = this;
  }
});

// </editor-fold>    END CLOCK ////////////////////////////////////////////////


// <editor-fold> <<<< SOCKET IO >>>> --------------------------------------- //

// <editor-fold>       <<<< SOCKET IO - SETUP >>>> -------------- //
var ioConnection;
if (window.location.hostname == 'localhost') {
  ioConnection = io();
} else {
  ioConnection = io.connect(window.location.hostname);
}
var socket = ioConnection;
// </editor-fold>      END SOCKET IO - SETUP ///////////////////////

// <editor-fold>       <<<< SOCKET IO - START PIECE >>>> -------- //
socket.on('startpiecebroadcast', function(data) {
  if (startPieceGate) {
    startPieceGate = false;
    activateStartBtn = false;
    activatePauseStopBtn = true;
    controlPanel.smallify();
    pauseBtn.className = 'btn btn-1';
    stopBtn.className = 'btn btn-1';
    startPiece();
    startBtn.className = 'btn btn-1_inactive';
  }
});
// </editor-fold>      END SOCKET IO - START PIECE /////////////////

// <editor-fold>       <<<< SOCKET IO - CREATE EVENTS >>>> ------ //
socket.on('createEventsBroadcast', function(data) {
  var eventDataArr = data.eventDataArr;
  eventDataArr.forEach((it, ix) => {
    dials[ix].generateNotation(it);
  });
  if (startPieceGate) {
    activateStartBtn = true;
    activateSaveBtn = true;
    startBtn.className = 'btn btn-1';
    saveBtn.className = 'btn btn-1';
  }
});
// </editor-fold>      END SOCKET IO - CREATE EVENTS ///////////////

// <editor-fold>       <<<< SOCKET IO - PAUSE BROADCAST >>>> ---- //
socket.on('pauseBroadcast', function(data) {
  pauseState = data.pauseState;
  if (pauseState == 0) { //unpaused
    timeAdjustment = data.pauseTime + timeAdjustment;
    var btnDOM = document.getElementById('pauseBtn');
    btnDOM.innerText = 'Pause';
    btnDOM.className = 'btn btn-1';
    var ctrlPanelDOM = document.getElementById('ctrlPanel');
    ctrlPanelDOM.smallify();
    animationGo = true;
    requestAnimationFrame(animationEngine);
  } else if (pauseState == 1) { //paused
    pausedTime = data.pauseTime
    animationGo = false;
    var btnDOM = document.getElementById('pauseBtn');
    btnDOM.innerText = 'Un-Pause';
    btnDOM.className = 'btn btn-2';
  }
});
// </editor-fold>      END SOCKET IO - PAUSE BROADCAST /////////////

// <editor-fold>       <<<< SOCKET IO - LOAD PIECE >>>> --------- //
socket.on('loadPieceBroadcast', function(data) {
  var eventsArray = data.eventsArray;
  eventsArray.forEach((it, ix) => {
    dials[ix].generateNotation(it);
  });
  if (startPieceGate) {
    activateStartBtn = true;
    activateSaveBtn = true;
    startBtn.className = 'btn btn-1';
    saveBtn.className = 'btn btn-1';
  }
});
// </editor-fold>      END SOCKET IO - LOAD PIECE //////////////////

// <editor-fold>       <<<< SOCKET IO - STOP >>>> --------------- //
socket.on('stopBroadcast', function(data) {
  location.reload();
});
// </editor-fold>      END SOCKET IO - STOP ////////////////////////

// <editor-fold>       <<<< SOCKET IO - NEW TEMPO >>>> ---------- //
socket.on('newTempoBroadcast', function(data) {
  dials.forEach(function(it, ix) {
    it.newTempoFunc(data.newTempo);
  })
});
// </editor-fold>      END SOCKET IO - NEW TEMPO ///////////////////

//</editor-fold> END SOCKET IO ////////////////////////////////////////////////


// <editor-fold> <<<< ANIMATION FUNCTIONS >>>> ----------------------------- //

// <editor-fold>        <<<< UPDATE >>>> ----------------------- //
function update(aMSPERFRAME, currTimeMS) {
  framect++;
  dials.forEach((it, ix) => {
    it.animateFunc(currTimeMS);
  });
}
// </editor-fold>       END UPDATE ////////////////////////////////

// <editor-fold>        <<<< DRAW >>>> ------------------------- //
function draw() {}
// </editor-fold>       END DRAW //////////////////////////////////

// <editor-fold>        <<<< ANIMATION ENGINE >>>> ------------- //
function animationEngine(timestamp) {
  var t_now = new Date(ts.now());
  t_lt = t_now.getTime() - timeAdjustment;
  calcClock(t_lt);
  // console.log(clockTimeHrs + ":" + clockTimeMin + ":" + clockTimeSec + ":" + clockTimeMS);
  delta += t_lt - lastFrameTimeMs;
  lastFrameTimeMs = t_lt;
  while (delta >= MSPERFRAME) {
    update(MSPERFRAME, t_lt);
    draw();
    delta -= MSPERFRAME;
  }
  if (animationGo) requestAnimationFrame(animationEngine);
}
// </editor-fold>       END ANIMATION ENGINE //////////////////////

// </editor-fold> END ANIMATION FUNCTIONS /////////////////////////////////////


// <editor-fold> <<<< FUNCTIONS >>>> --------------------------------------- //

// <editor-fold>       <<<< FUNCTION GET ORIGINAL IMAGE SIZE >>>> - //
function processImg(url) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve({
      w: img.width,
      h: img.height
    });
    img.onerror = reject;
    img.src = url;
  })
}
// </editor-fold>      END FUNCTION GET ORIGINAL IMAGE SIZE //////////

// <editor-fold>       <<<< FUNCTION GET NOTATION SIZES >>>> ------ //
async function getImgDimensions(urls2DArr, array2DToPopulate) {
  for (const [ix1, urlSet] of urls2DArr.entries()) {
    for (const [ix2, url] of urlSet.entries()) {
      var dimensions = await processImg(url);
      var sizeArr = [];
      sizeArr.push(url);
      sizeArr.push(dimensions.w);
      sizeArr.push(dimensions.h);
      array2DToPopulate[ix1].push(sizeArr);
      if (ix1 == (urls2DArr.length - 1) && ix2 == (urlSet.length - 1)) {
        activateButtons = true;
        //make Dial objects and generate static elements
        makeDials();
      }
    }
  }
}
// </editor-fold>      FUNCTION GET NOTATION SIZES ///////////////////

// <editor-fold>       <<<< MAKE SVG CANVAS >>>> ------------------ //
function mkSVGcanvas(canvasID, w, h) {
  var tsvgCanvas = document.createElementNS(SVG_NS, "svg");
  tsvgCanvas.setAttributeNS(null, "width", w);
  tsvgCanvas.setAttributeNS(null, "height", h);
  tsvgCanvas.setAttributeNS(null, "id", canvasID);
  tsvgCanvas.style.backgroundColor = "black";
  return tsvgCanvas;
}
// </editor-fold>      END MAKE SVG CANVAS ///////////////////////////

// <editor-fold>       <<<< MAKE JSPANEL >>>> --------------------- //
function mkPanel(panelid, svgcanvas, w, h, title) {
  var tpanel;
  jsPanel.create({
    position: 'center-top',
    id: panelid,
    contentSize: w.toString() + " " + h.toString(),
    header: 'auto-show-hide',
    headerControls: {
      minimize: 'remove',
      // smallify: 'remove',
      maximize: 'remove',
      close: 'remove'
    },
    contentOverflow: 'hidden',
    headerTitle: title,
    theme: "light",
    content: svgcanvas, //svg canvas lives here
    resizeit: {
      aspectRatio: 'content',
      resize: function(panel, paneldata, e) {}
    },
    callback: function() {
      tpanel = this;
    }
  });
  return tpanel;
}
// </editor-fold>      END MAKE JSPANEL /////////////////////////////

// </editor-fold> END FUNCTIONS ///////////////////////////////////////////////
