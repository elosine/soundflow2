// FUNCTION: clamp ---------------------------------------------- //
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
// FUNCTION: mtof -------------------------------------------------- //
function mtof(midinote) {
  var freq;
  freq = Math.pow(2, ((midinote - 69) / 12)) * 440;
  return freq;
}
// FUNCTION: ftom -------------------------------------------------- //
function ftom(freq) {
  var midi;
  midi = (Math.log2((freq / 440)) * 12) + 69;
  return midi;
}
// FUNCTION: rrand ------------------------------------------------- //
function rrand(min, max) {
  return Math.random() * (max - min) + min;
}
// FUNCTION: rrandInt ---------------------------------------------- //
function rrandInt(min, max) {
  var tmin = min - 0.4999999;
  var tmax = max + 0.4999999;
  return Math.round(Math.random() * (tmax - tmin) + tmin);
}
// FUNCTION: rrandInt ---------------------------------------------- //
function rrandIntFloor(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
// FUNCTION: rrand ------------------------------------------------- //
function choose(tempSet) {
  var randpick = rrandIntFloor(0, tempSet.length);
  return tempSet[randpick];
}
// FUNCTION: scale -------------------------------------------------- //
const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
// FUNCTION: norm -------------------------------------------------- //
const norm = (num, in_min, in_max) => {
  return (num - in_min) * (1.0 - 0.0) / (in_max - in_min);
}
// FUNCTION: shuffle ------------------------------------------------ //
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// FUNCTION: chooseWeighted -----------------------------------
function chooseWeighted(items, chances) {
  var sum = chances.reduce((acc, el) => acc + el, 0);
  var acc = 0;
  chances = chances.map(el => (acc = el + acc));
  var rand = Math.random() * sum;
  return items[chances.filter(el => el <= rand).length];
}
// FUNCTION: palindromeTimeContainers -----------------------------------
function palindromeTimeContainers(dur, minval, maxval, pctmin, pctmax) {
  var timeCont = [];
  var currtime = 0;
  var newdur = dur;
  var newminval = minval;
  while (newdur > (dur / 2)) {
    var tc = newminval;
    timeCont.push(currtime);
    currtime = currtime + tc;
    newdur = newdur - tc;
    newminval = Math.min((newminval * (1 + rrand(pctmin, pctmax))), maxval);
  }
  while (newdur >= 0) {
    var tc = newminval;
    timeCont.push(currtime);
    currtime = currtime + tc;
    newdur = newdur - tc;
    newminval = Math.max((newminval * (1 - rrand(pctmin, pctmax))), minval);
  }
  return timeCont;
}
// FUNCTION: array3dtoString -----------------------------------
function array3dtoString(arr) {
  var tempstr = "";
  for (var i = 0; i < arr.length; i++) {
    var tempstr1 = "";
    for (var j = 0; j < arr[i].length; j++) {
      var tempstr2 = "";
      for (var k = 0; k < arr[i][j].length; k++) {
        if (k == 0) {
          tempstr2 = arr[i][j][k].toString();
        } else {
          tempstr2 = tempstr2 + "&" + arr[i][j][k].toString();
        }
      }
      if (j == 0) {
        tempstr1 = tempstr2;
      } else {
        tempstr1 = tempstr1 + ";" + tempstr2;
      }
    }
    if (i == 0) {
      tempstr = tempstr1;
    } else {
      tempstr = tempstr + ":" + tempstr1;
    }
  }
  return tempstr;
}
// FUNCTION: sortFunction2DArray -----------------------------------
//use like this: array.sort(sortFunction2DArray)
function sortFunction2DArray(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    //change a[0] < b[0] to a[1] < b[1] to sort by second column etc
    return (a[0] < b[0]) ? -1 : 1;
  }
}
// FUNCTION: findIndicesOfMax -----------------------------------
function findIndicesOfMax(inp, count) {
  var outp = [];
  for (var i = 0; i < inp.length; i++) {
    outp.push(i); // add index to output array
    if (outp.length > count) {
      outp.sort(function(a, b) {
        return inp[b] - inp[a];
      }); // descending sort the output array
      outp.pop(); // remove the last index (index of smallest element in output array)
    }
  }
  return outp;
}
// FUNCTION: downloadStrToHD -----------------------------------
// download('the content of the file', 'filename.txt', 'text/plain');
function downloadStrToHD(strData, strFileName, strMimeType) {
  var D = document,
    A = arguments,
    a = D.createElement("a"),
    d = A[0],
    n = A[1],
    t = A[2] || "text/plain";

  //build download link:
  a.href = "data:" + strMimeType + "charset=utf-8," + escape(strData);

  if (window.MSBlobBuilder) { // IE10
    var bb = new MSBlobBuilder();
    bb.append(strData);
    return navigator.msSaveBlob(bb, strFileName);
  } /* end if(window.MSBlobBuilder) */

  if ('download' in a) { //FF20, CH19
    a.setAttribute("download", n);
    a.innerHTML = "downloading...";
    D.body.appendChild(a);
    setTimeout(function() {
      var e = D.createEvent("MouseEvents");
      e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      D.body.removeChild(a);
    }, 66);
    return true;
  }; /* end if('download' in a) */

  //do iframe dataURL download: (older W3)
  var f = D.createElement("iframe");
  D.body.appendChild(f);
  f.src = "data:" + (A[2] ? A[2] : "application/octet-stream") + (window.btoa ? ";base64" : "") + "," + (window.btoa ? window.btoa : escape)(strData);
  setTimeout(function() {
    D.body.removeChild(f);
  }, 333);
  return true;
}

function scrambleCount(numtocount) {
  var scrambledCt = [];
  for (var i = 0; i < numtocount; i++) {
    scrambledCt.push(i);
  }
  for (let i = scrambledCt.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [scrambledCt[i], scrambledCt[j]] = [scrambledCt[j], scrambledCt[i]];
  }
  return scrambledCt;
}
// FUNCTION: rads ---------------------------------------------------- //
function rads(deg) {
  return (deg * Math.PI) / 180;
}

function roundByStep(value, step) {
  step || (step = 1.0);
  var inv = 1.0 / step;
  return Math.round(value * inv) / inv;
}
//FUNCTION floorByStep --------------------------------------------------------------------- //
function floorByStep(value, step) {
  step || (step = 1.0);
  var inv = 1.0 / step;
  return Math.floor(value * inv) / inv;
}
//FUNCTION plot --------------------------------------------------------------------- //
function midiToSpeed(ogmidi, destmidi) {
  var tspeed = Math.pow(2, (destmidi - ogmidi) * (1.0 / 12.0));
  return tspeed;
}
//FUNCTION plot --------------------------------------------------------------------- //
function limitRange(num, min, max) {
  var tnewval;
  tnewval = Math.min(num, max);
  tnewval = Math.max(tnewval, min);
  return tnewval;
}
//FUNCTION plot --------------------------------------------------------------------- //
function stringTo3DFloatArray(text) {
  var pitchesArray1 = [];
  var t1 = text.split(":");
  for (var i = 0; i < t1.length; i++) {
    var temparr = t1[i].split(';');
    var t3 = [];
    for (var j = 0; j < temparr.length; j++) {
      var temparr2 = temparr[j].split("&");
      var t4 = [];
      for (var k = 0; k < temparr2.length; k++) {
        t4.push(temparr2[k].split(","));
      }
      var tnewFloatArr = [];
      for (var l = 0; l < t4.length; l++) {
        tnewFloatArr.push(parseFloat(t4[l]));
      }
      t3.push(tnewFloatArr);
    }
    pitchesArray1.push(t3);
  }
  return pitchesArray1;
}
//FUNCTION plot --------------------------------------------------------------------- //
function distributeOverRange(min, max, numVals) {
  var trange = max - min;
  var tinc = trange / numVals;
  var tvals = [];
  for (var i = 0; i < numVals; i++) {
    tvals.push(min + rrand((i * tinc), ((i + 1) * tinc)));
  }
  return tvals;
}
//FUNCTION plot --------------------------------------------------------------------- //
function plot(fn, range, width, height) {
  var tpoints = [];
  var widthScale = (width / (range[1] - range[0]));
  var heightScale = (height / (range[3] - range[2]));
  var first = true;
  for (var x = 0; x < width; x++) {
    var xFnVal = (x / widthScale) - range[0];
    var yGVal = (fn(xFnVal) - range[2]) * heightScale;
    yGVal = height - yGVal; // 0,0 is top-left
    var tar = {};
    tar.x = x;
    tar.y = yGVal;
    first = false;
    tpoints.push(tar);
  }
  return tpoints;
}
Array.prototype.clone = function() {
  return this.slice(0);
};
//FUNCTION removeDuplicates -------------------------------------------------------- //
function removeDuplicates(arr) {
  var c;
  var len = arr.length;
  var result = [];
  var obj = {};
  for (c = 0; c < len; c++) {
    obj[arr[c]] = 0;
  }
  for (c in obj) {
    result.push(parseInt(c));
  }
  return result;
}
//TIMEDISPLAY ------------------------------------------------------------------------ //
var objToday = new Date(),
  weekday = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
  dayOfWeek = weekday[objToday.getDay()],
  dayNum = objToday.getDay() + 1,
  domEnder = function() {
    var a = objToday;
    if (/1/.test(parseInt((a + "").charAt(0)))) return "th";
    a = parseInt((a + "").charAt(1));
    return 1 == a ? "st" : 2 == a ? "nd" : 3 == a ? "rd" : "th"
  }(),
  dayOfMonth = objToday + (objToday.getDate() < 10) ? '0' + objToday.getDate() + domEnder : objToday.getDate() + domEnder,
  months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
  curMonth = months[objToday.getMonth()],
  monthNum = objToday.getMonth() + 1,
  curYear = objToday.getFullYear(),
  curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
  curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
  curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds(),
  curMeridiem = objToday.getHours() > 12 ? "PM" : "AM";
//FUNCTION pad -------------------------------------------------------------- //
function pad(num, size) {
  var s = "000000000" + num;
  return s.substr(s.length - size);
}
//FUNCTION playsamp ----------------------------------------------------------------- //
function playSamp(audioContext, path, rate) {
  var source = audioContext.createBufferSource();
  var request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    actx.decodeAudioData(request.response, function(buffer) {
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.loop = false;
      source.playbackRate.value = rate;
      source.start();
    }, function(e) {
      console.log('Audio error! ', e);
    });
  }
  request.send();
}
//sorting numbers
function sortNumArr(arr) {
  arr.sort((a, b) => a - b);
  return arr;
}
// FUNCTION: isNonEmptyArrayLike ----------------------------------------------------- //
function isNonEmptyArrayLike(obj) {
  try { // don't bother with `typeof` - just access `length` and `catch`
    return obj.length > 0 && '0' in Object(obj);
  } catch (e) {
    return false;
  }
}
// FUNCTION: beats2seconds ----------------------------------------------------------- //
function beats2seconds(bpm, numbts) {
  var t_secPerBeat = 1.0 / (bpm / 60.0);
  var t_sec = t_secPerBeat * numbts;
  return t_sec;
}
// FUNCTION: singleTempo ------------------------------------------------------------- //
function singleTempo(tempo, instNum, startTime, endTime, btIncsAr) {
  var t_btIncsAr = btIncsAr.clone();
  t_btIncsAr.unshift(1, 0.25);
  var t_durSec = endTime - startTime;
  var t_durMS = Math.ceil(t_durSec * 1000.0);
  var t_beatNum = 0;
  var t_lastBeatTcSec = 0;
  var t_btsFloat = 0.0;
  var t_btsPerMs = tempo / 60000.0;
  // Initial Events @ 0 /////////////////////////////////////////
  eventSet.push([startTime, instNum, 8, -1]); //inital event marker
  eventSet.push([startTime, instNum, 0, -1]); //inital beat marker
  var t_btIncsTcSec = [];
  var t_numIncs = [];
  var t_incCtr = [];
  if (isNonEmptyArrayLike(t_btIncsAr)) {
    for (var i = 0; i < t_btIncsAr.length; i++) {
      t_btIncsTcSec.push([t_btIncsAr[i],
        []
      ]);
      t_numIncs.push(1);
      t_incCtr.push(0);
    }
  }
  for (var i = 0; i < t_durMS; i++) {
    var t_tcSec = (i / 1000.0) + startTime; //timecode in seconds
    for (var j = 0; j < t_btIncsAr.length; j++) {
      if (t_btIncsAr[j] == 1) {
        t_incCtr[j] = floorByStep(t_btsFloat, t_btIncsAr[j]) - t_numIncs[j];
        if (t_incCtr[j] == 0) {
          t_btIncsTcSec[j][1].push(t_tcSec);
          eventSet.push([t_tcSec, instNum, 0, -1]);
          // if tempo is > 130 then draw half-notes
          if (tempo > 130) {
            if ((t_numIncs[j] % 2) == 0) {
              eventSet.push([t_tcSec, instNum, 7, -1]);
            }
          }
          t_numIncs[j]++;
        }
      } else if (t_btIncsAr[j] == 0.25) {
        t_incCtr[j] = floorByStep(t_btsFloat, t_btIncsAr[j]) - t_numIncs[j];
        if (t_incCtr[j] == 0) {
          t_btIncsTcSec[j][1].push(t_tcSec);
          // if tempo is < 60 then draw 16ths
          if (tempo < 60) {
            //don't draw on the beat just partials 2-4
            if ((t_numIncs[j] % 4) != 0) {
              eventSet.push([t_tcSec, instNum, 6, -1]);
            }
          }
          t_numIncs[j]++;
        }
      } else {
        t_incCtr[j] = floorByStep(t_btsFloat, t_btIncsAr[j]) - t_numIncs[j];
        if (t_incCtr[j] == 0) {
          t_btIncsTcSec[j][1].push(t_tcSec);
          t_numIncs[j]++;
        }
      }
    }
    t_btsFloat = t_btsFloat + t_btsPerMs;
  }
  return t_btIncsTcSec;
}
// FUNCTION: singleTempoGenerator_numBeats ------------------------------------------- //
function singleTempoGenerator_numBeats(tempo, instNum, startTime, numBeats, a_btIncAr) {

  var t_dur = beats2seconds(tempo, numBeats);
  var t_endtime = startTime + t_dur;
  singleTempo(tempo, instNum, startTime, t_endtime, a_btIncAr);
  return t_endtime;
}
// PROBABILITY --------------------------------------
function probability(n) {
  return !!n && Math.random() <= n;
};










//
