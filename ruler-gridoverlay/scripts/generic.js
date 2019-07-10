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
gridOverlayObject.setZIndex(50);
gridOverlayObject.setColor("#000");
var rulerBars = new RulerBars();

var initColors = function() {
	[].forEach.call(document.querySelectorAll("[data-colorcode]"), function(item) {
		item.style.backgroundColor = item.getAttribute("data-colorcode");
		if (item.parentNode.classList.contains("guideColorSet")) {
			item.addEventListener("click", function(e) {
				document.querySelector(".guideColorSet .selected").classList.remove("selected");
				rulerBars.setGuideColor(e.target.getAttribute("data-colorcode"));
				rulerBars.setTempGuideColor(e.target.getAttribute("data-colorcode"));
				e.target.classList.add("selected");
			}, false);
		} else if (item.parentNode.classList.contains("gridColorSet")) {
			item.addEventListener("click", function(e) {
				document.querySelector(".gridColorSet .selected").classList.remove("selected");
				gridOverlayObject.setColor(e.target.getAttribute("data-colorcode"));
				e.target.classList.add("selected");
			}, false);
		}
	});
};
initColors();

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
	document.querySelector(".gridColorSet").classList.remove("hide");
};
var hideOverlay = function() {
	gridOverlayObject.removeGridOverlay();
	document.querySelector(".hideBtn").classList.add("hide");
	document.querySelector(".showBtn").classList.remove("hide");
	document.querySelector(".gridColorSet").classList.add("hide");
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
	document.querySelector(".guideColorSet").classList.remove("hide");
	document.querySelector(".toolPanel").style.left = "30px";
};
var hideRuler = function() {
	rulerBars.hideRulers();
	document.querySelector(".hideRulerBtn").classList.add("hide");
	document.querySelector(".showRulerBtn").classList.remove("hide");
	[].forEach.call(document.querySelectorAll(".guideBtn"), function(guideBtn) {
		guideBtn.classList.add("visibleNone");
	});
	document.querySelector(".guideColorSet").classList.add("hide");
	document.querySelector(".toolPanel").style.left = "0px";
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
var lockGuides = function() {
	rulerBars.lockGuides();
	document.querySelector(".lockGuides").classList.add("hide");
	document.querySelector(".unlockGuides").classList.remove("hide");
};
var unlockGuides = function() {
	rulerBars.unlockGuides();
	document.querySelector(".lockGuides").classList.remove("hide");
	document.querySelector(".unlockGuides").classList.add("hide");
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
	var scale = convertZoomPercentToScale(zoomPercentage);
	var topStartPoint = getComputedStyle(imgElem, null)["left"];
	topStartPoint = !isNaN(parseInt(topStartPoint, 10)) ? parseInt(topStartPoint, 10) : 0;
	var leftStartPoint = getComputedStyle(imgElem, null)["top"];
	leftStartPoint = !isNaN(parseInt(leftStartPoint, 10)) ? parseInt(leftStartPoint, 10) : 0;

	rulerBars.createRulers({
		top : {
			size : 2000,
			startPoint : Math.ceil(-topStartPoint / scale)
		},
		left : {
			size : 1400,
			startPoint : Math.ceil(-leftStartPoint / scale)
		},
		element : imgElem,
		zIndex : 150,
		outerBorderColor : "rgb(191,191,191)",
		outerBorderThickness : "2px",
		foregroundColor : "rgb(191,191,191)",
		unitFontColor : "#000",
		// congruentUnits : true /* this ensures that small & medium lines are sized congruently */
	});
};

var pan = function(left, top) {
	var scale = convertZoomPercentToScale(zoomPercentage);
	var imgElem = document.querySelector("#imageContainer img");
	imgElem.style.left = left + "px";
	imgElem.style.top = top + "px";
	imgElem.removeAttribute("data-left-position");
	imgElem.removeAttribute("data-top-position");
	zoomTheImage(scale);
	gridOverlayObject.zoom(scale);

	var topStartPoint = getComputedStyle(imgElem, null)["left"];
	topStartPoint = !isNaN(parseInt(topStartPoint, 10)) ? parseInt(topStartPoint, 10) : 0;
	var leftStartPoint = getComputedStyle(imgElem, null)["top"];
	leftStartPoint = !isNaN(parseInt(leftStartPoint, 10)) ? parseInt(leftStartPoint, 10) : 0;

	var cfg = rulerBars.getConfig();
	cfg.top.startPoint = Math.ceil(-topStartPoint / scale);
	cfg.left.startPoint = Math.ceil(-leftStartPoint / scale);

	rulerBars.updateRulers(cfg);
};

var panningTest = function() {
	document.querySelector(".expandCollapseBar").click();
	var random = parseInt((Math.random() * 10), 10);
	var startPointSets = [];
	for (var i = 96; i < 400; i += 53) {
		startPointSets.push([ i + random, i + 47 + random ]);
	}
	for (var i = 453; i > -196; i -= 53) {
		startPointSets.push([ i + random, i + 47 + random ]);
	}
	for (var i = -156; i < 200; i += 20) {
		startPointSets.push([ i + random, i + random ]);
	}
	startPointSets.push([ 50, 50 ]);

	for (var i = 0; i < startPointSets.length; i++) {
		(function(idx, len) {
			setTimeout(function() {
				pan(startPointSets[idx][0], startPointSets[idx][1]);
				if (idx === len - 1) {
					var btn = document.querySelector(".collapsed .expandCollapseBar");
					btn && btn.click();
				}
			}, (300 * i));
		}(i, startPointSets.length));
	}
};

/* Create Rulers on Page Load */
createRulers();

/* Check and toggle the "Clear All Guides" Button */
toggleClearGuidesButton();

/* Enable the Guides on Page Load */
enableGuides();

/* Setting Page Load Zoom to 90% Hence invoking doZoom("-") 1 time */
doZoom("-");