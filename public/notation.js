// <editor-fold> <<<< GLOBAL VARIABLES >>>> -------------------------------- //
// CLOCK -------------------------- >
var framect = 0;
var delta = 0.0;
var lastFrameTimeMs = 0.0;
var startTime;
var clockTimeMS, clockTimeSec, clockTimeMin, clockTimeHrs;
// 3JS SCENE --------------------- >
var CAM_Z = 45;
var CAM_Y = -150;
var CAM_ROTATION_X = rads(0);
var RUNWAY_ROTATION_X = -25
var TRACK_DIAMETER = 6;
var TRACK_Y_OFFSET = 3;
var SCENE_W = 200;
var SCENE_H = 300;
var CRV_H = 170;
var RUNWAYLENGTH = 380;
var RUNWAYHALF = RUNWAYLENGTH / 2;
var RUNWAYSTART = RUNWAYLENGTH / 2;
var t_numFrets = 11;
// TIMING ------------------------- >
var FRAMERATE = 60.0;
var MSPERFRAME = 1000.0 / FRAMERATE;
var SECPERFRAME = 1.0 / FRAMERATE;
var RUNWAY_PXPERSEC = 40.0;
var RUNWAY_PXPERMS = RUNWAY_PXPERSEC / 1000.0;
var RUNWAY_PXPERFRAME = RUNWAY_PXPERSEC / FRAMERATE;
var RUNWAY_GOFRETPOS_Y = -RUNWAYLENGTH / 2;
var RUNWAY_GOFRETHEIGHT = 4;
var PIECE_MAX_DURATION = 3600;
var RUNWAYLENGTH_FRAMES = RUNWAYLENGTH / RUNWAY_PXPERFRAME;
var timeAdjustment = 10;
// SVG ---------------------------- >
var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_XLINK = 'http://www.w3.org/1999/xlink';
// CONTROL PANEL ------------------ >
var controlPanel;
var ctrlPanelH = 95;
var ctrlPanelW = 310;
var cbs = []; //checkboxes
// BUTTONS ------------------------ >
var activateButtons = true; //use this if you need to do some time consuming processing before anything else
var activateStartBtn = false;
var activatePauseStopBtn = false;
var activateSaveBtn = false;
// START -------------------------- >
var startPieceGate = true;
var pauseState = 0;
var pausedTime = 0;
var animationGo = true;
// COLORS ------------------------ >
var clr_seaGreen = new THREE.Color("rgb(0, 255, 108)");
var clr_neonMagenta = new THREE.Color("rgb(255, 21, 160)");
var clr_neonBlue = new THREE.Color("rgb(6, 107, 225)");
var clr_forest = new THREE.Color("rgb(11, 102, 35)");
var clr_jade = new THREE.Color("rgb(0, 168, 107)");
var clr_neonGreen = new THREE.Color("rgb(57, 255, 20)");
var clr_limegreen = new THREE.Color("rgb(153, 255, 0)");
var clr_yellow = new THREE.Color("rgb(255, 255, 0)");
var clr_orange = new THREE.Color("rgb(255, 128, 0)");
var clr_red = new THREE.Color("rgb(255, 0, 0)");
var clr_purple = new THREE.Color("rgb(255, 0, 255)");
var clr_neonRed = new THREE.Color("rgb(255, 37, 2)");
var clr_safetyOrange = new THREE.Color("rgb(255, 103, 0)");
var clr_green = new THREE.Color("rgb(0, 255, 0)");
// EVENTS --------------------------------- >
// numOfParts, cresDurRangeArr, igapRangeArr = 4, deltaAsPercentRangeArr, numOfCyclesRangeArr
var numOfParts = 12;
var cresDurRangeArr = [14, 14];
var igapRangeArr = [4, 4];
var durDeltaAsPercentRangeArr = [-0.07, 0.07];
var gapDeltaAsPercentRangeArr = [0.07, 0.13];
var numOfCyclesRangeArr = [9, 13];
var scoreDataForAll; //global event data stored here; events are sent through the network to all players
var eventsForAll; //generated events stored here
var notationObjects = [];
var partsToRun = [];
// RUN BEFORE INIT ------------------------ >
////-- TIMESYNC ENGINE --////
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
// </editor-fold> END GLOBAL VARIABLES ////////////////////////////////////////


// <editor-fold> <<<< START UP SEQUENCE >>>> ------------------------------- //
//START UP SEQUENCE DOCUMENTATION
//// --> init() is run from html
//// --------> It makes the controlPanel
//// --> The ctrlPanel:Generate Piece/Load Piece button:
//// --------> Generates Score Data for all parts using generateScoreData
//// --------> Sends eventData to all clients
//// --------> SocketIO receiver createEventsBroadcast
////// -----------> Stores data in scoreDataForAll
////// -----------> Generates events with mkAllEvents and stores in eventsForAll
////// -----------> Generate static elements for parts that are checked
//// --> The ctrlPanel:Start button runs startPiece():
//// --------> Starts clockSync engine
//// --------> Starts Animation Engine
// INIT --------------------------------------------------- //
function init() { //run from html onload='init();'
  // MAKE CONTROL PANEL ---------------- >
  controlPanel = mkCtrlPanel("ctrlPanel", ctrlPanelW, ctrlPanelH, "Control Panel");
}
// FUNCTION: startPiece ----------------------------------- //
function startPiece() {
  startClockSync();
  requestAnimationFrame(animationEngine);
}
// FUNCTION: startClockSync ------------------------------- //
function startClockSync() {
  var t_now = new Date(ts.now());
  lastFrameTimeMs = t_now.getTime();
  startTime = lastFrameTimeMs;
}
// </editor-fold> END START UP SEQUENCE ///////////////////////////////////////


// <editor-fold> <<<< NOTATION OBJECT - RUNWAY_CURVEFOLLOW >>>> ------------ //

// <editor-fold>    <<<< NOTATION OBJECT - INIT >>>> ---------------- //
function mkNotationObject_runwayCurveFollow(ix, w, h, len, placementOrder /*[#, ofTotal]*/ ) {
  var notationObj = {};
  notationObj['ix'] = ix;
  //Placement in window
  var roffsetX, roffsetY, rautopos;
  var coffsetX, coffsetY, cautopos;
  var partOrderNum = placementOrder[0];
  var totalParts = placementOrder[1];
  var txoffset
  var yoffset = 0;
  if (placementOrder[1] == 1) { //only one part
    roffsetX = '0px';
    roffsetY = '0px';
    rautopos = 'none';
    coffsetX = '0px';
    coffsetY = h.toString();
    cautopos = 'down';
  } else {
    if (totalParts < 7) { //6 parts or less
      txoffset = partOrderNum - (totalParts / 2) + 0.5;
    } else { //rows of 6
      if (partOrderNum < 6) { //top row
        yoffset = 0;
        txoffset = partOrderNum - (6 / 2) + 0.5;
      } else { //bottom row
        txoffset = partOrderNum - 6 - ((totalParts - 6) / 2) + 0.5;
        yoffset = SCENE_H + CRV_H + 20;
      }
    }
    roffsetX = (txoffset * (w + 7)).toString() + 'px';
    roffsetY = yoffset.toString() + 'px';
    rautopos = 'none';
    coffsetX = (txoffset * (w + 7)).toString() + 'px';
    coffsetY = (h + yoffset).toString() + 'px';
    cautopos = 'none';
  }
  // Curve Follower
  var CRV_W = w - 4;
  var crvCoords = plot(function(x) {
    return Math.pow(x, 2.4);
  }, [0, 1, 0, 1], CRV_W, CRV_H);
  var crvFollowData = [];
  // Generate ID
  var id = 'runwayCurveFollow' + ix;
  notationObj['id'] = id;
  // Make Canvases ------------- >
  //// Runway ////
  var runwayCanvasID = id + 'runwayCanvas';
  var runwayCanvas = mkCanvasDiv(runwayCanvasID, w, h, '#000000');
  notationObj['runwayCanvas'] = runwayCanvas;
  //// Curve Follower ////
  var crvFollowCanvasID = id + 'crvFollowCanvas';
  var crvFollowCanvas = mkSVGcanvas(crvFollowCanvasID, CRV_W, CRV_H);
  notationObj['crvFollowCanvas'] = crvFollowCanvas;
  // Make jsPanels ----------------- >
  //// Runway ////
  var runwayPanelID = id + 'runwayPanel';
  var runwayPanel = mkPanel(runwayPanelID, runwayCanvas, w, h, "Player " + ix.toString() + " - Runway", ['center-top', roffsetX, roffsetY, rautopos]);
  notationObj['runwayPanel'] = runwayPanel;
  //// Curve Follower ////
  var crvFollowPanelID = id + 'crvFollowPanel';
  var crvFollowPanel = mkPanel(crvFollowPanelID, crvFollowCanvas, CRV_W, CRV_H, "Player " + ix.toString() + " - Curve", ['center-top', coffsetX, coffsetY, cautopos]);
  notationObj['crvFollowPanel'] = crvFollowPanel;
  // </editor-fold>       END NOTATION OBJECT - INIT /////////

  // <editor-fold>  <<<< NOTATION OBJECT - 3JS >>>> ----------------- //
  // CAMERA ----------------- >
  var camera = new THREE.PerspectiveCamera(75, w / h, 1, 3000);
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.rotation.x = rads(CAM_ROTATION_X);
  notationObj['camera'] = camera;
  // SCENE ----------------- >
  var scene = new THREE.Scene();
  notationObj['scene'] = scene;
  // LIGHTS ----------------- >
  var lights = [];
  var sun = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  sun.position.set(100, 600, 700);
  scene.add(sun);
  lights.push(sun);
  var sun2 = new THREE.DirectionalLight(0x40A040, 0.6);
  sun2.position.set(-100, 350, 775);
  scene.add(sun2);
  lights.push(sun2);
  notationObj['lights'] = lights;
  // RENDERER ----------------- >
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(w, h);
  runwayCanvas.appendChild(renderer.domElement);
  notationObj['renderer'] = renderer;
  // </editor-fold>       END NOTATION OBJECT - INIT /////////

  // <editor-fold>  <<<< NOTATION OBJECT - STATIC ELEMENTS >>>> ----- //
  // RUNWAY ----------------------------------------------- //
  //// Runway -------------------------- >
  var conveyor = new THREE.Group();
  var t_runwayW = w * 0.67;
  var runwayMatl =
    new THREE.MeshLambertMaterial({
      color: 0x0040C0
    });
  var runwayGeom = new THREE.PlaneGeometry(
    t_runwayW,
    len,
  );
  var runway = new THREE.Mesh(runwayGeom, runwayMatl);
  runway.position.z = -len / 2;
  conveyor.add(runway);
  notationObj['runway'] = runway;
  //// Track -------------------------- >
  var trgeom = new THREE.CylinderGeometry(TRACK_DIAMETER, TRACK_DIAMETER, len, 32);
  var trmatl = new THREE.MeshLambertMaterial({
    color: 0x708090
  });
  var tTr = new THREE.Mesh(trgeom, trmatl);
  tTr.position.z = -(len / 2);
  tTr.position.y = (-TRACK_DIAMETER / 2) + TRACK_Y_OFFSET;
  tTr.position.x = 0;
  conveyor.add(tTr);
  notationObj['track'] = tTr;
  //// Frets --------------------------- >
  var fretGeom = new THREE.CylinderGeometry(2, 2, t_runwayW, 32);
  var fretMatl = new THREE.MeshLambertMaterial({
    color: clr_seaGreen
  });
  var t_fretGap = RUNWAYLENGTH / t_numFrets;
  for (var i = 0; i < t_numFrets; i++) {
    var t_fret = new THREE.Mesh(fretGeom, fretMatl);
    t_fret.rotation.z = rads(-90);
    t_fret.position.z = -(len / 2);
    t_fret.position.y = RUNWAYSTART - (t_fretGap * (i + 1));
    conveyor.add(t_fret);
  }
  //// Go Fret ------------------------ >
  var goFretGeom = new THREE.CylinderGeometry(4, 4, t_runwayW, 32);
  var goFretMatl = new THREE.MeshLambertMaterial({
    color: clr_neonMagenta
  });
  var goFret = new THREE.Mesh(goFretGeom, goFretMatl);
  goFret.rotation.z = rads(-90);
  goFret.position.z = -(len / 2);
  goFret.position.y = -RUNWAYLENGTH / 2;
  conveyor.add(goFret);
  // CURVE FOLLOWER --------------------------------------------- //
  //// Curve Follow Rect -------------- >
  var tcrvFollowRect = document.createElementNS(SVG_NS, "rect");
  tcrvFollowRect.setAttributeNS(null, "x", "0");
  tcrvFollowRect.setAttributeNS(null, "y", CRV_W.toString());
  tcrvFollowRect.setAttributeNS(null, "width", CRV_W);
  tcrvFollowRect.setAttributeNS(null, "height", 0);
  tcrvFollowRect.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
  tcrvFollowRect.setAttributeNS(null, "id", id + "crvFollowRect");
  // tcrvFollowRect.setAttributeNS(null, "transform", "translate( 0, -2)");
  crvFollowCanvas.appendChild(tcrvFollowRect);
  notationObj['crvFollowRect'] = tcrvFollowRect;
  //// Curve -------------------------- >
  var tSvgCrv = document.createElementNS(SVG_NS, "path");
  var tpathstr = "";
  for (var i = 0; i < crvCoords.length; i++) {
    if (i == 0) {
      tpathstr = tpathstr + "M" + crvCoords[i].x.toString() + " " + crvCoords[i].y.toString() + " ";
    } else {
      tpathstr = tpathstr + "L" + crvCoords[i].x.toString() + " " + crvCoords[i].y.toString() + " ";
    }
  }
  tSvgCrv.setAttributeNS(null, "d", tpathstr);
  tSvgCrv.setAttributeNS(null, "stroke", "rgba(255, 21, 160, 0.5)");
  tSvgCrv.setAttributeNS(null, "stroke-width", "4");
  tSvgCrv.setAttributeNS(null, "fill", "none");
  tSvgCrv.setAttributeNS(null, "id", id + "crv");
  // tSvgCrv.setAttributeNS(null, "transform", "translate( 0, -2)");
  crvFollowCanvas.appendChild(tSvgCrv);
  notationObj['crv'] = tSvgCrv;
  //// Curve Follower ---------------- >
  var tSvgCirc = document.createElementNS(SVG_NS, "circle");
  tSvgCirc.setAttributeNS(null, "cx", crvCoords[0].x.toString());
  tSvgCirc.setAttributeNS(null, "cy", crvCoords[0].y.toString());
  tSvgCirc.setAttributeNS(null, "r", "10");
  tSvgCirc.setAttributeNS(null, "stroke", "none");
  tSvgCirc.setAttributeNS(null, "fill", "rgba(255, 21, 160, 0.5)");
  tSvgCirc.setAttributeNS(null, "id", id + "crvCirc");
  // tSvgCirc.setAttributeNS(null, "transform", "translate( 0, -3)");
  crvFollowCanvas.appendChild(tSvgCirc);
  notationObj['crvCirc'] = tSvgCirc;
  //Make Follower Data for maping in animation [gate, currentCoord]
  var tcrvFset = [];
  tcrvFset.push(false);
  tcrvFset.push(0.0);
  crvFollowData.push(tcrvFset);
  // </editor-fold>     END NOTATION OBJECT - STATIC ELEMENTS //

  // <editor-fold>  <<<< NOTATION OBJECT - 3JS RENDER ACTIONS >>>> -- //
  // ROTATE GROUP ----------------- >
  conveyor.rotation.x = rads(RUNWAY_ROTATION_X);
  scene.add(conveyor);
  notationObj['conveyor'] = conveyor;
  // RENDER ----------------- >
  renderer.render(scene, camera);
  // </editor-fold>    END NOTATION OBJECT - 3JS RENDER ACTIONS >> -- //

  // <editor-fold>  <<<< NOTATION OBJECT - ANIMATE >>>> ------------- //
  notationObj['animate'] = function(eventMatrix) {
    //This loop runs through all events
    //All events need to be advanced position.y
    for (var i = 0; i < eventMatrix.length; i++) {
      var t_mesh = eventMatrix[i][1];
      var t_eventLen = eventMatrix[i][7];
      var t_mesh_tail = t_mesh.position.y + (t_eventLen / 2);
      //advance event if it is not past gofret
      if (t_mesh_tail > RUNWAY_GOFRETPOS_Y) {
        t_mesh.position.y -= RUNWAY_PXPERFRAME;
      }
    }
    //This loop runs through only events on scene
    for (var i = 0; i < eventMatrix.length; i++) {
      var t_mesh = eventMatrix[i][1];
      var t_eventLen = eventMatrix[i][7];
      var t_mesh_tail = t_mesh.position.y + (t_eventLen / 2);
      var t_goFrame = Math.round(eventMatrix[i][2]);
      var onSceneFrame = t_goFrame - RUNWAYLENGTH_FRAMES;
      // So you don't run through the entire events array, only the ones on scene
      if (framect <= onSceneFrame) {
        break;
      }
      var t_renderGate = eventMatrix[i][0];
      // - (t_eventLen/2) is because y=0 is the center of the object
      var t_mesh_head = t_mesh.position.y - (t_eventLen / 2);
      var t_endFrame = Math.round(eventMatrix[i][6]);
      //add the event to the scene if it is on the runway
      if (t_mesh_head < RUNWAYHALF && t_mesh_tail > RUNWAY_GOFRETPOS_Y) {
        if (t_renderGate) {
          eventMatrix[i][0] = false;
          conveyor.add(t_mesh);
          scene.add(conveyor);
        }
      }
      //Event Reaches Goline
      if (framect > t_goFrame && framect <= t_endFrame) {
        var crvFollowDataNorm = scale(framect, t_goFrame, t_endFrame, 0.0, 1.0);
        var tcoordsix = Math.floor(scale(crvFollowDataNorm, 0.0, 1.0, 0, crvCoords.length));
        tcoordsix = constrain(tcoordsix, 0, (crvCoords.length - 1));
        //circ
        tSvgCirc.setAttributeNS(null, "cx", crvCoords[tcoordsix].x.toString());
        tSvgCirc.setAttributeNS(null, "cy", crvCoords[tcoordsix].y.toString());
        //rect
        var temph = CRV_H - crvCoords[tcoordsix].y;
        tcrvFollowRect.setAttributeNS(null, "y", crvCoords[tcoordsix].y.toString());
        tcrvFollowRect.setAttributeNS(null, "height", temph.toString());
      }
      //end of event remove
      if (framect == t_endFrame) {
        //Reset Curve Follower
        tSvgCirc.setAttributeNS(null, "cx", crvCoords[0].x.toString());
        tSvgCirc.setAttributeNS(null, "cy", crvCoords[0].y.toString());
        tcrvFollowRect.setAttributeNS(null, "y", CRV_W.toString());
        tcrvFollowRect.setAttributeNS(null, "height", 0);
        //Remove runway event
        var obj2Rmv = scene.getObjectByName(t_mesh.name);
        conveyor.remove(obj2Rmv);
        //Remove Event from Array
        eventMatrix.splice(0, 1);
      }
    }
  }
  // </editor-fold>    END NOTATION OBJECT - ANIMATE >>>> ----------- //

  return notationObj;
}
// </editor-fold> <<<< END NOTATION OBJECT >>>> ---------------------------- //


// <editor-fold> <<<< EVENTS >>>> ---------------------------- //

// <editor-fold>      <<<< EVENTS - GENERATE SCORE DATA //
//Events have equal length
//Gaps between events increase a percentage each event for a certain number
//of events then revert to the initial gap growing again
function generateScoreData(numOfParts, cresDurRangeArr, igapRangeArr, durDeltaAsPercentRangeArr, gapDeltaAsPercentRangeArr, numOfCyclesRangeArr) {
  var scoreDataArray = [];
  for (var i = 0; i < numOfParts; i++) {
    var cresDur = rrand(cresDurRangeArr[0], cresDurRangeArr[1]);
    var igap = rrand(igapRangeArr[0], igapRangeArr[1]);
    var durDeltaAsPercent = rrand(durDeltaAsPercentRangeArr[0], durDeltaAsPercentRangeArr[1]);
    var gapDeltaAsPercent = rrand(gapDeltaAsPercentRangeArr[0], gapDeltaAsPercentRangeArr[1]);
    var numOfCycles = rrandInt(numOfCyclesRangeArr[0], numOfCyclesRangeArr[1]);
    var temp_data = generateEventData(cresDur, igap, durDeltaAsPercent, gapDeltaAsPercent, numOfCycles);
    scoreDataArray.push(temp_data);
  }
  return scoreDataArray;
}
// </editor-fold>     END EVENTS - GENERATE SCORE DATA //

// <editor-fold>      <<<< EVENTS - GENERATE EVENT DATA //
//Events start all equal length
//Events & Gaps between events increase a percentage each event for a certain number
//of events then revert to the initial gap growing again
function generateEventData(cresDur, igap, durDeltaAsPercent, gapDeltaAsPercent, numOfCycles) {
  var eventDataArray = [];
  var newDur = cresDur;
  var newGap = igap;
  var maxNumEvents = PIECE_MAX_DURATION / cresDur;
  var currCycle = 0;
  var goTime = 0;
  eventDataArray.push([goTime, cresDur]);
  for (var i = 0; i < maxNumEvents; i++) {
    var tempArr = [];
    goTime = goTime + newDur + newGap;
    tempArr.push(goTime);
    tempArr.push(newDur);
    eventDataArray.push(tempArr);
    currCycle++;
    if ((currCycle % numOfCycles) == 0) {
      newDur = cresDur;
      newGap = igap;
    } else {
      newDur = newDur * (1 + durDeltaAsPercent);
      newGap = newGap * (1 + gapDeltaAsPercent);
    }
  }
  //longest/shortest Dur = igap * Math.pow( (1+changeDeltaAsPercent), numOfCycles )
  return eventDataArray;
}
// </editor-fold>     END EVENTS - GENERATE EVENT DATA //

// <editor-fold>      <<<< EVENTS - MAKE ALL EVENTS //
function mkAllEvents(scoreData) {
  var allEventsMatrix = [];
  for (var i = 0; i < scoreData.length; i++) {
    var tempEvents = mkEvents(scoreData[i]);
    allEventsMatrix.push(tempEvents);
  }
  return allEventsMatrix;
}
// </editor-fold>     END EVENTS - MAKE ALL EVENTS //

// <editor-fold>      <<<< EVENTS - MAKE EVENTS //
function mkEvents(eventsData) {
  var tEventMatrix = [];
  var teventMeshIx = 0;
  for (var i = 0; i < eventsData.length; i++) {
    var tEventSet = [];
    var tTimeGopxGoFrm = [];
    var tTime = eventsData[i][0];
    var tDur = eventsData[i][1];
    tTime = tTime + timeAdjustment;
    var tEventLength = tDur * RUNWAY_PXPERSEC;
    var tNumPxTilGo = tTime * RUNWAY_PXPERSEC;
    var tiGoPx = RUNWAY_GOFRETPOS_Y + tNumPxTilGo;
    var tGoFrm = Math.round(tNumPxTilGo / RUNWAY_PXPERFRAME);
    var tempMatl = new THREE.MeshLambertMaterial({
      color: clr_neonMagenta,
    });
    var teventdurframes = Math.round(tDur * FRAMERATE);
    var tOffFrm = tGoFrm + teventdurframes;
    var tEventGeom = new THREE.CylinderGeometry(TRACK_DIAMETER + 3, TRACK_DIAMETER + 3, tEventLength, 32);
    var tEventMesh = new THREE.Mesh(tEventGeom, tempMatl);
    tEventMesh.position.y = tiGoPx + (tEventLength / 2.0);
    tEventMesh.position.z = -(RUNWAYLENGTH / 2);
    tEventMesh.position.x = 0;
    tEventMesh.name = "runwayEvent" + teventMeshIx;
    teventMeshIx++;
    var tnewCresEvent = [true, tEventMesh, tGoFrm, tTime, tNumPxTilGo, tiGoPx, tOffFrm, tEventLength];
    tEventMatrix.push(tnewCresEvent);
  }
  return tEventMatrix;
}
// </editor-fold>     END EVENTS - MAKE EVENTS //

// </editor-fold> END EVENTS ////////////////////////////////////


// <editor-fold> <<<< CONTROL PANEL >>>> ----------------------------------- //

// <editor-fold>       <<<< CONTROL PANEL - INIT >>>> ----------- //

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
      //[ Array of gotime and dur for each part:[gotime,dur] ]
      var scoreData = generateScoreData(numOfParts, cresDurRangeArr, igapRangeArr, durDeltaAsPercentRangeArr, gapDeltaAsPercentRangeArr, numOfCyclesRangeArr);
      socket.emit('createEvents', {
        eventDataArr: scoreData
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
          var playersArr = dataAsText.split("!");
          playersArr.forEach(function(it, ix) {
            var t1 = it.split(";");
            var thisPlayersEvents = [];
            for (var i = 0; i < t1.length; i++) {
              t2 = [];
              var temparr = t1[i].split(',');
              t2.push(parseFloat(temparr[0]));
              t2.push(parseFloat(temparr[1]));
              thisPlayersEvents.push(t2);
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
        scoreDataForAll.forEach(function(it, ix) {
          var eventData = it;
          for (var i = 0; i < eventData.length; i++) {
            if (i != (eventData.length - 1)) { //if not last (last item will not have semicolon)
              for (var j = 0; j < eventData[i].length; j++) {
                if (j == (eventData[i].length - 1)) {
                  eventDataStr = eventDataStr + eventData[i][j].toString() + ";"; //semicolon for last one
                } else {
                  eventDataStr = eventDataStr + eventData[i][j].toString() + ","; // , for all others
                }
              }
            } else { //last one don't include semicolon
              for (var j = 0; j < eventData[i].length; j++) {
                if (j == (eventData[i].length - 1)) {
                  eventDataStr = eventDataStr + eventData[i][j].toString() + "!";
                } else {
                  eventDataStr = eventDataStr + eventData[i][j].toString() + ",";
                }
              }
            }
          }

        });
        var t_now = new Date(ts.now());
        var month = t_now.getMonth() + 1;
        var eventsFileName = "soundflow2_" + t_now.getFullYear() + "_" + month + "_" + t_now.getUTCDate() + "_" + t_now.getHours() + "-" + t_now.getMinutes();
        downloadStrToHD(eventDataStr, eventsFileName, 'text/plain');
      }
    }
  });
  ctrlPanelDiv.appendChild(saveBtn);
  // </editor-fold>    END CONTROL PANEL - SAVE ////////////////////

  // <editor-fold>     <<<< CONTROL PANEL - CHECKBOXES >>>> - //
  for (var i = 0; i < 12; i++) {
    var cbar = [];
    var cb = document.createElement("input");
    cb.id = 'cb' + i.toString();
    cb.type = 'checkbox';
    cb.value = '0';
    cb.checked = '';
    cb.style.width = '15px';
    cb.style.height = '15px';
    cb.style.position = 'absolute';
    cb.style.top = '61px';
    var tl = 5 + (17 * i);
    var tl2 = 10 + (17 * i);
    if (i > 10) {
      tl = tl + (i - 10) * 5;
      tl2 = tl2 + (i - 10) * 4;
    }
    cb.style.left = tl.toString() + 'px';
    ctrlPanelDiv.appendChild(cb);
    cbar.push(cb);
    var cblbl = document.createElement("label");
    cblbl.setAttribute("for", 'cb' + i.toString());
    cblbl.innerHTML = "P" + i.toString();
    cblbl.style.fontSize = "11px";
    cblbl.style.color = "white";
    cblbl.style.fontFamily = "Lato";
    cblbl.style.position = 'absolute';
    cblbl.style.top = '77px';
    cblbl.style.left = tl2.toString() + 'px';
    ctrlPanelDiv.appendChild(cblbl);
    cbar.push(cblbl);
    cbs.push(cbar);
  }

  // </editor-fold>       END CONTROL PANEL - CHECKBOXES //////

  // <editor-fold>     <<<< CONTROL PANEL - jsPanel >>>> -------- //
  // jsPanel
  jsPanel.create({
    position: 'left-bottom',
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


// <editor-fold> <<<< CLOCK >>>> ------------------------------------------- //

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
  scoreDataForAll = data.eventDataArr;
  // Generate events for this player from event data here and store in eventsForAll
  eventsForAll = mkAllEvents(scoreDataForAll);
  // GENERATE STATIC ELEMENTS ------------------- >
  //Based on which player checkboxes are chosen
  cbs.forEach((it, ix) => {
    if (it[0].checked) {
      partsToRun.push(ix);
    }
  });
  partsToRun.forEach((it, ix) => {
    var newNO = mkNotationObject_runwayCurveFollow(it, SCENE_W, SCENE_H, RUNWAYLENGTH, [ix, partsToRun.length]);
    notationObjects.push(newNO);
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
  scoreDataForAll = data.eventsArray;
  // Generate events for this player from event data here and store in eventsForAll
  eventsForAll = mkAllEvents(scoreDataForAll);
  // GENERATE STATIC ELEMENTS ------------------- >
  //Based on which player checkboxes are chosen
  cbs.forEach((it, ix) => {
    if (it[0].checked) {
      partsToRun.push(ix);
    }
  });
  partsToRun.forEach((it, ix) => {
    var newNO = mkNotationObject_runwayCurveFollow(it, SCENE_W, SCENE_H, RUNWAYLENGTH, [ix, partsToRun.length]);
    notationObjects.push(newNO);
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
  notationObjects.forEach(function(it, ix) {
    it.animate(eventsForAll[it.ix]);
  });
}
// </editor-fold>       END UPDATE ////////////////////////////////

// <editor-fold>        <<<< DRAW >>>> ------------------------- //
function draw() {
  // RENDER ///////////////////////////////////////////////////////////////
  notationObjects.forEach(function(it, ix) {
    it.renderer.render(it.scene, it.camera);
  });
}
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

// <editor-fold>       <<<< MAKE CANVAS DIV >>>> ------------------ //
function mkCanvasDiv(canvasID, w, h, clr) {
  var t_div = document.createElement("div");
  t_div.style.width = w.toString() + "px";
  t_div.style.height = h.toString() + "px";
  t_div.style.background = clr;
  t_div.id = canvasID;
  return t_div;
}
// </editor-fold>      END MAKE CANVAS DIV ///////////////////////////

// <editor-fold>       <<<< MAKE JSPANEL >>>> --------------------- //
function mkPanel(panelid, svgcanvas, w, h, title, posArr) {
  var tpanel;
  var posString = posArr[0];
  var offsetX = posArr[1];
  var offsetY = posArr[2];
  var autoposition = posArr[3];
  jsPanel.create({
    // position: 'center-top',
    //  position: {
    //     bottom: 50,
    //     right: 50
    // },
    position: {
      my: posString,
      at: posString,
      offsetX: offsetX,
      offsetY: offsetY,
      autoposition: autoposition
    },
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
