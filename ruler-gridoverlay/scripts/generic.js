/**
 * Copyright(c) - 2019 Ashish's Web
 * 
 * Author: K.C.Ashish Kumar
 * 
 * https://kcak11.com (or) https://ashishkumarkc.com
 */

var zoomPercentage = 100;

/* 10% change i.e. 110%, 120%, 130%, . . . */
var zoomSteps = 10;

var imageContainer = document.querySelector("#imageContainer");
var imgElem = document.querySelector("#imageContainer img");
var gridOverlayObject = new GridOverlay(imageContainer, imgElem);
gridOverlayObject.gridColor = "#000";
var rulerBars = new RulerBars();

var doExpandCollapse = function(btn) {
	var panel = btn.parentNode;
	if (panel.classList.contains("expanded")) {
		panel.classList.remove("expanded");
		panel.classList.add("collapsed");
	} else {
		panel.classList.add("expanded");
		panel.classList.remove("collapsed");
	}
};

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
/**
 * 100% ==> 1.0
 */
var convertZoomPercentToScale = function(zp) {
	return zp / 100;
};
var zoomTheImage = function(scale) {
	var theImage = document.querySelector("#imageContainer img");
	theImage.style.transformOrigin = "0 0";
	theImage.style.transform = "scale(" + scale + ")";
	var theImageStyle = getComputedStyle(theImage, null);
	var left = !isNaN(parseFloat(theImageStyle["left"])) ? parseFloat(theImageStyle["left"]) : 0;
	var top = !isNaN(parseFloat(theImageStyle["top"])) ? parseFloat(theImageStyle["top"]) : 0;
	if (!theImage.getAttribute("data-left-position")) {
		theImage.setAttribute("data-left-position", left);
	}
	if (!theImage.getAttribute("data-top-position")) {
		theImage.setAttribute("data-top-position", top);
	}
	theImage.style.left = (parseFloat(theImage.getAttribute("data-left-position")) * scale) + "px";
	theImage.style.top = (parseFloat(theImage.getAttribute("data-top-position")) * scale) + "px";
};
var doZoom = function(type) {
	if (type === "+") {
		zoomPercentage += zoomSteps;
	} else {
		zoomPercentage -= zoomSteps;
		if (zoomPercentage < 10) {
			zoomPercentage = 10;
		}
	}
	var scale = convertZoomPercentToScale(zoomPercentage);
	zoomTheImage(scale);
	gridOverlayObject.zoom(scale);
	rulerBars.zoom(scale);
	document.querySelector("#displayZoomValue").innerHTML = zoomPercentage;
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
var clearGuides = function() {
	rulerBars.clearGuides();
};
var toggleClearGuidesButton = function() {
	var clearGuidesButton = document.querySelector(".clearGuides");
	setInterval(function() {
		if (!rulerBars.isVisible()) {
			return;
		}
		var guideLines = document.querySelectorAll(".rulerGuideLine");
		if (guideLines.length > 0) {
			clearGuidesButton.disabled = false;
		} else {
			clearGuidesButton.disabled = true;
		}
	}, 200);
};
var createRulers = function() {
	var topStartPoint = getComputedStyle(imgElem, null)["left"];
	topStartPoint = !isNaN(parseInt(topStartPoint, 10)) ? parseInt(topStartPoint, 10) : 0;
	var leftStartPoint = getComputedStyle(imgElem, null)["top"];
	leftStartPoint = !isNaN(parseInt(leftStartPoint, 10)) ? parseInt(leftStartPoint, 10) : 0;

	rulerBars.createRulers({
		top : {
			size : 2000,
			startPoint : -topStartPoint
		},
		left : {
			size : 1400,
			startPoint : -leftStartPoint
		},
		element : imgElem,
		zIndex : 150
	});
};

/**
 * Run on Page Load
 */

createRulers();
toggleClearGuidesButton();

/* Enable the Guides on Page Load */
enableGuides();

/* Setting Page Load Zoom to 80% Hence invoking doZoom("-") 2 times */
doZoom("-");
doZoom("-");