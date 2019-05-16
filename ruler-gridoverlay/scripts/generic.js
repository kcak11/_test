/**
  Copyright(c) - 2019 Ashish's Web
  Author: K.C.Ashish Kumar
  https://kcak11.com (or) https://ashishkumarkc.com
*/

var zoomPercentage = 100;

/* 5% change i.e. 105%, 110%, 115%, . . . */
var zoomSteps = 5;

var imageContainer = document.querySelector("#imageContainer");
var imgElem = document.querySelector("#imageContainer img");
var gridOverlayObject = new GridOverlay(imageContainer,imgElem);
gridOverlayObject.gridColor = "#000";
var rulerBars = new RulerBars();

var showOverlay = function() {
    var scale = convertZoomPercentToScale(zoomPercentage);
    gridOverlayObject.createGridOverlay(scale);
    document.querySelector(".hideBtn").classList.remove("hide");
    document.querySelector(".showBtn").classList.add("hide");
};
var hideOverlay = function() {
    gridOverlayObject.removeGridOverlay();
    document.querySelector(".hideBtn").classList.add("hide");
    document.querySelector(".showBtn").classList.remove("hide");
};
var increaseGridSize = function(val) {
    gridOverlayObject.increment(val);
};
var decreaseGridSize = function(val) {
    gridOverlayObject.decrement(val);
};
/**
  100% ==> 1.0
*/
var convertZoomPercentToScale = function(zp) {
    return zp / 100;
};
var zoomIncrease = function() {
    zoomPercentage += zoomSteps;
    var scale = convertZoomPercentToScale(zoomPercentage);
    if (gridOverlayObject.gridActive) {
        increaseGridSize(scale);
    }
    var theImage = document.querySelector("#imageContainer img");
    theImage.style.transformOrigin = "0 0";
    theImage.style.transform = "scale(" + scale + ")";
};
var zoomDecrease = function() {
    zoomPercentage -= zoomSteps;
    var scale = convertZoomPercentToScale(zoomPercentage);
    if (gridOverlayObject.gridActive) {
        decreaseGridSize(scale);
    }
    var theImage = document.querySelector("#imageContainer img");
    theImage.style.transformOrigin = "0 0";
    theImage.style.transform = "scale(" + scale + ")";
};
var showRuler = function() {
    var rulers = document.querySelectorAll(".ruler");
    if (rulers.length > 0) {
        rulerBars.showRulers();
    } else {
        createRulers();
    }
    document.querySelector(".hideRulerBtn").classList.remove("hide");
    document.querySelector(".showRulerBtn").classList.add("hide");
    [].forEach.call(document.querySelectorAll(".guideBtn"), function(guideBtn) {
        guideBtn.classList.remove("visibleNone");
    });
};
var hideRuler = function() {
    rulerBars.hideRulers();
    document.querySelector(".hideRulerBtn").classList.add("hide");
    document.querySelector(".showRulerBtn").classList.remove("hide");
    [].forEach.call(document.querySelectorAll(".guideBtn"), function(guideBtn) {
        guideBtn.classList.add("visibleNone");
    });
};
var showGuideTip = function() {
    clearTimeout(window.showGuideTipTimer);
    document.querySelector(".guideTip").classList.remove("hide");
    window.showGuideTipTimer = setTimeout(function() {
        document.querySelector(".guideTip").classList.add("hide");
    }, 3000);
};
var enableGuides = function() {
    rulerBars.enableGuides();
    document.querySelector(".enableGuides").classList.add("hide");
    document.querySelector(".disableGuides").classList.remove("hide");
    showGuideTip();
};
var disableGuides = function() {
    rulerBars.disableGuides();
    document.querySelector(".enableGuides").classList.remove("hide");
    document.querySelector(".disableGuides").classList.add("hide");
    document.querySelector(".guideTip").classList.add("hide");
};
var createRulers = function() {
    rulerBars.createRulers({
        top: {
            size: 2000
        },
        left: {
            size: 1400
        }
    });
};
createRulers();