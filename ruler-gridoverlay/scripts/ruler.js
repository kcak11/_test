/**
 * Copyright(c) - 2019 Ashish's Web
 * 
 * Author: K.C.Ashish Kumar https://kcak11.com (or) https://ashishkumarkc.com
 * 
 * Repository: https://github.com/kcak11/pens
 * LICENSE: MIT - https://mit-license.kcak11.com
 */

(function(w) {
	/* _global: global storage of Ruler related data. */
	var _global = {};
	_global.RULER_THICKNESS = 30;
	_global.topGuides = {};
	_global.leftGuides = {};
	_global.UNSET = "UNSET";

	/**
	 * Utility functions
	 */
	var Util = {
		applyCSSRule : function(defn, id) {
			var stl = document.createElement("style");
			stl.type = "text/css";
			if (id) {
				var _stl = document.querySelector("#" + id);
				_stl && _stl.parentNode.removeChild(_stl);
				stl.id = id;
			}
			if (stl.styleSheet) {
				stl.styleSheet.cssText = "\n" + defn + "\n";
			} else {
				stl.appendChild(document.createTextNode("\n" + defn + "\n"));
			}
			document.querySelector("head").appendChild(stl);
		},
		createConfig : function(config) {
			try {
				return JSON.parse(JSON.stringify(config));
			} catch (exjs) {
				return config;
			}
		},
		getUniqueID : function() {
			var chars = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			return chars.split("").sort(function() {
				return Math.random() - Math.random();
			}).join("");
		},
		bindFunc : function(func, ctx) {
			return function() {
				return func.apply(ctx, arguments);
			}
		},
		resetGlobal : function() {
			_global = {};
			_global.unitSize = 10;
			_global.RULER_THICKNESS = 30;
			_global.topGuides = {};
			_global.leftGuides = {};
			_global.UNSET = "UNSET";
			_global.HORIZONTAL_TEMPORARY_GUIDE = document.createElement("div");
			_global.HORIZONTAL_TEMPORARY_GUIDE.className = "tempGuideHorizontal tempGuide invisible";
			_global.VERTICAL_TEMPORARY_GUIDE = document.createElement("div");
			_global.VERTICAL_TEMPORARY_GUIDE.className = "tempGuideVertical tempGuide invisible";
		}
	};

	/**
	 * Guide constructor
	 * 
	 * @e: The event object
	 * @config: The ruler config object
	 * @ruler: The ruler DOM element
	 */
	var Guide = function(e, config, ruler) {
		if (!(this instanceof Guide)) {
			throw new Error("Guide is a constructor, use the \"new\" operator to create new instance.");
		}
		var _this = this;
		var startPoint = _global.rulerBarsConfig[config.side].startPoint;
		this.side = config.side;
		this.offsetProp = (this.side === "top") ? "offsetX" : "offsetY";
		this[this.offsetProp] = Math.ceil(e[this.offsetProp]);
		this.positionVal = Math.ceil(e[this.offsetProp] - _global.RULER_THICKNESS) + ((_global.rulerBarsConfig[this.side].startPoint % _global.unitSize) - _global.unitSize);
		this.guidePosition = this.positionVal + "px";
		var entry = this.positionVal + startPoint + _global.unitSize;
		if (_global[this.side + "Guides"][entry + "px"] || entry < (_global.unitSize + (startPoint % _global.unitSize))) {
			return;
		}
		this.direction = (this.side === "top") ? "left" : "top";
		this.guideLine = document.createElement("div");
		this.guideLine.id = "guide_" + Util.getUniqueID();
		this.guideLine.className = "rulerGuideLine " + ((this.side === "top") ? "verticalGuideLine" : "horizontalGuideLine");
		this.guideLine.style[this.direction] = this.guidePosition;
		var entry = this.positionVal + startPoint + _global.unitSize;
		_global[this.side + "Guides"][(entry - 2) + "px"] = {
			"guide" : this
		};
		_global[this.side + "Guides"][(entry - 1) + "px"] = {
			"guide" : this
		};
		_global[this.side + "Guides"][entry + "px"] = {
			"guide" : this,
			setByUser : true
		};
		_global[this.side + "Guides"][(entry + 1) + "px"] = {
			"guide" : this
		};
		_global[this.side + "Guides"][(entry + 2) + "px"] = {
			"guide" : this
		};
		ruler.appendChild(this.guideLine);
	};

	/**
	 * Destroy the Guide
	 */
	Guide.prototype.destroy = function() {
		var startPoint = _global.rulerBarsConfig[this.side].startPoint;
		var entry = this.positionVal + startPoint + _global.unitSize;
		this.guideLine.parentNode.removeChild(this.guideLine);
		delete _global[this.side + "Guides"][(entry - 2) + "px"];
		delete _global[this.side + "Guides"][(entry - 1) + "px"];
		delete _global[this.side + "Guides"][entry + "px"];
		delete _global[this.side + "Guides"][(entry + 1) + "px"];
		delete _global[this.side + "Guides"][(entry + 2) + "px"];
	};

	/**
	 * Constructor for creating rulers.
	 */
	w.RulerBars = function() {
		if (!(this instanceof RulerBars)) {
			throw new Error("RulerBars is a constructor, use the \"new\" operator to create new instance.");
		}
		this.destroy();
		registerDefaultCSS();
		registerFunctionsWithContext(this);
		document.addEventListener("mouseout", function(e) {
			var from = e.relatedTarget || e.toElement;
			if (!from || from.nodeName === "HTML") {
				if (_global.activeGuide) {
					_global.activeGuide.destroy();
					_global.activeGuide = null;
				}
			}
		}, false);
	};

	/**
	 * Register default CSS
	 */
	var registerDefaultCSS = function() {
		var rulerCSS = " \
			.ruler { \
				position: absolute; \
				top: 30px; \
				left: 30px; \
				box-sizing: border-box; \
			} \
			 \
			.rulerBG { \
				position: absolute; \
			} \
			 \
			.ruler.top { \
				border-bottom: none; \
			} \
			 \
			.ruler.top.guideEnabled { \
				cursor: col-resize; \
			} \
			 \
			.ruler.left { \
				border-right: none; \
			} \
			 \
			.ruler.left.guideEnabled { \
				cursor: row-resize; \
			} \
			 \
			.ruler.top .big, .ruler.top .medium, .ruler.top .small { \
				position: absolute; \
				width: 10px; \
				border-left: 1px solid #000; \
				box-sizing: border-box; \
				pointer-events: none; \
			} \
			 \
			.ruler.left .big, .ruler.left .medium, .ruler.left .small { \
				position: absolute; \
				height: 10px; \
				border-top: 1px solid #000; \
				box-sizing: border-box; \
				pointer-events: none; \
			} \
			 \
			.ruler.top .big { \
				top: -20px; \
				height: 20px; \
			} \
			 \
			.ruler.top .medium { \
				top: -10px; \
				height: 10px; \
			} \
			 \
			.ruler.top .small { \
				top: -5px; \
				height: 5px; \
			} \
			 \
			.ruler.left .big { \
				left: -20px; \
				width: 20px; \
			} \
			 \
			.ruler.left .medium { \
				left: -10px; \
				width: 10px; \
			} \
			 \
			.ruler.left .small { \
				left: -5px; \
				width: 5px; \
			} \
			 \
			.ruler.top .big:before { \
				content: attr(unit-value); \
				font-size: 8px; \
				font-family: Verdana; \
				position: absolute; \
				top: -3px; \
				left: 2px; \
				text-align: left; \
			} \
			 \
			.ruler.left .big:before { \
				content: attr(unit-value); \
				font-size: 8px; \
				font-family: Verdana; \
				position: absolute; \
				right: 8px; \
				bottom: 2px; \
				text-align: left; \
				transform-origin: 0 0; \
				transform: rotate(-90deg); \
				width: 15px; \
			} \
			 \
			.noselect { \
				-webkit-touch-callout: none; \
				-webkit-user-select: none; \
				-khtml-user-select: none; \
				-moz-user-select: none; \
				-ms-user-select: none; \
				user-select: none; \
			}";
		Util.applyCSSRule(rulerCSS, "rulerDefaultCSS");

		var cssDefinition = "";
		cssDefinition += ".invisible{visibility:hidden;}";
		Util.applyCSSRule(cssDefinition, "ruler_default_css");
	};

	/**
	 * Bind the functions with the RulerBars context.
	 * 
	 * @ctx: The RulerBars context
	 */
	var registerFunctionsWithContext = function(ctx) {
		if (typeof getRuler === "function") {
			getRuler = Util.bindFunc(getRuler, ctx);
		}
		if (typeof showTemporaryGuide === "function") {
			showTemporaryGuide = Util.bindFunc(showTemporaryGuide, ctx);
		}
		if (typeof rulerMouseDown === "function") {
			rulerMouseDown = Util.bindFunc(rulerMouseDown, ctx);
		}
		if (typeof rulerMouseMove === "function") {
			rulerMouseMove = Util.bindFunc(rulerMouseMove, ctx);
		}
		if (typeof rulerMouseUp === "function") {
			rulerMouseUp = Util.bindFunc(rulerMouseUp, ctx);
		}
		if (typeof rulerMouseOver === "function") {
			rulerMouseOver = Util.bindFunc(rulerMouseOver, ctx);
		}
		if (typeof rulerMouseOut === "function") {
			rulerMouseOut = Util.bindFunc(rulerMouseOut, ctx);
		}
		if (typeof rulerClick === "function") {
			rulerClick = Util.bindFunc(rulerClick, ctx);
		}
		if (typeof adjustGuidePosition === "function") {
			adjustGuidePosition = Util.bindFunc(adjustGuidePosition, ctx);
		}
	};

	/**
	 * Create a Ruler.
	 * 
	 * @config: object
	 * @config.size: The desired length of the ruler in pixels, default is 100.
	 * @config.side: "top" or "left", default is "top".
	 * @config.startPoint: The startPoint for the ruler, default is 0.
	 */
	var getRuler = function(config) {
		var _this = this;
		if (typeof config !== "object") {
			throw new Error("Invalid config param, expected object.");
		}
		config = config || {};
		_global.rulerBarsConfig.backgroundColor = _global.rulerBarsConfig.backgroundColor || "#fff";
		_global.rulerBarsConfig.foregroundColor = _global.rulerBarsConfig.foregroundColor || "#000";
		_global.rulerBarsConfig.unitFontColor = _global.rulerBarsConfig.unitFontColor || "#000";
		_global.rulerBarsConfig.outerBorderColor = _global.rulerBarsConfig.outerBorderColor || "#000";
		_global.rulerBarsConfig.outerBorderThickness = _global.rulerBarsConfig.outerBorderThickness || "1px";
		_global.rulerBarsConfig.smallMediumEqual = Boolean(_global.rulerBarsConfig.smallMediumEqual) || false;
		_global.rulerBarsConfig.hideFirstUnitOnScale = Boolean(_global.rulerBarsConfig.hideFirstUnitOnScale) || false;
		config.side = (config.side === "left") ? config.side : "top";
		config.size = parseInt(config.size, 10) || 100;
		_global.rulerBarsConfig.tempGuideColor = _global.rulerBarsConfig.tempGuideColor || "#ffaaab";
		_global.rulerBarsConfig.guideColor = _global.rulerBarsConfig.guideColor || "#ff0400";
		if (!config.size || isNaN(config.size) || config.size < 0) {
			throw new Error("Invalid size parameter specified " + config.size + ". Expected positive number.");
		}
		config.startPoint = parseInt(config.startPoint, 10) || 0;
		if (isNaN(config.startPoint)) {
			throw new Error("Invalid startPoint specified, expected number.");
		}
		var startPointDelta = config.startPoint % _global.unitSize;
		var rulerThickness = _global.RULER_THICKNESS;
		var ruler = document.createElement("div");
		ruler.className = "rulerBar ruler " + config.side;
		var rulerBG = document.createElement("div");
		rulerBG.className = "rulerBG rulerBG_" + config.side;
		rulerBG.style.backgroundColor = _global.rulerBarsConfig.backgroundColor;
		rulerBG.style.boxSizing = "border-box";
		ruler.appendChild(rulerBG);
		var big = document.createElement("div");
		big.className = "big";
		var medium = document.createElement("div");
		medium.className = "medium";
		var small = document.createElement("div");
		small.className = "small";
		if (Boolean(_global.rulerBarsConfig.smallMediumEqual)) {
			small.className = "medium";
		}
		var units = [ big, medium, small ];
		var iterations = Math.ceil(config.size / _global.unitSize);
		var unitAdjustment = 0;
		if (config.startPoint > 0 && ((config.startPoint % 10) !== 0)) {
			unitAdjustment = 10;
		}
		for (var i = Math.ceil(config.startPoint / _global.unitSize), ctr = 0; i <= iterations; i++) {
			var unit;
			if (Math.abs(i) % _global.unitSize === 0) {
				unit = big.cloneNode(true);
				unit.setAttribute("unit-value", (i * _global.unitSize));
			} else if (Math.abs(i) % 2 === 1) {
				unit = small.cloneNode(true);
			} else if (Math.abs(i) % 2 === 0) {
				unit = medium.cloneNode(true);
			}
			unit.style[config.side === "top" ? "left" : "top"] = ((ctr * _global.unitSize) + unitAdjustment) + "px";
			if (ctr === 0 && _global.rulerBarsConfig.hideFirstUnitOnScale && startPointDelta !== 0) {
				unit.style.visibility = "hidden";
			}
			ruler.appendChild(unit);
			ctr++;
		}
		ruler.style[config.side === "top" ? "width" : "height"] = ((ctr * _global.unitSize) - _global.unitSize) + "px";

		var rulerBGAdditionalSize = 0;
		if (startPointDelta > 0) {
			rulerBGAdditionalSize = 10;
		}
		ruler.style[config.side === "top" ? "left" : "top"] = (rulerThickness - startPointDelta) + "px";
		rulerBG.style[config.side === "top" ? "width" : "height"] = ((ctr * _global.unitSize) + rulerThickness - startPointDelta + rulerBGAdditionalSize) + "px";
		rulerBG.style[config.side === "top" ? "border-bottom" : "border-right"] = "1px solid " + _global.rulerBarsConfig.foregroundColor;
		rulerBG.style[config.side === "top" ? "height" : "width"] = rulerThickness + "px";
		rulerBG.style[config.side === "top" ? "top" : "left"] = (-1 * rulerThickness) + "px";
		rulerBG.style[config.side === "top" ? "left" : "top"] = (-1 * (rulerThickness - startPointDelta + _global.unitSize)) + "px";

		var colorDefinitionTop = ".ruler.top, .ruler.top .big, .ruler.top .medium, .ruler.top .small{border-color: {{fgColor}};color: {{unitColor}};}";
		var colorDefinitionLeft = ".ruler.left, .ruler.left .big, .ruler.left .medium, .ruler.left .small  {border-color: {{fgColor}};color: {{unitColor}};}";
		var colorDefinition = (config.side === "top") ? colorDefinitionTop : colorDefinitionLeft;
		colorDefinition = colorDefinition.split("{{fgColor}}").join(_global.rulerBarsConfig.foregroundColor);
		colorDefinition = colorDefinition.split("{{unitColor}}").join(_global.rulerBarsConfig.unitFontColor);
		Util.applyCSSRule(colorDefinition, "rulerCSS_" + config.side);

		var guideDefinition;
		if (config.side === "left") {
			guideDefinition = ".tempGuideHorizontal{border:none;transform:scaleY(2.0);border-top:1px solid " + _global.rulerBarsConfig.tempGuideColor + ";pointer-events:none;position:absolute;left:-" + _global.RULER_THICKNESS + "px;top:0;width:" + (_global.rulerBarsConfig.top.size + _global.RULER_THICKNESS - _global.rulerBarsConfig.top.startPoint) + "px;}";
			guideDefinition += "\n.horizontalGuideLine{border:none;transform:scaleY(2.0);border-top:1px solid " + _global.rulerBarsConfig.guideColor + ";pointer-events:none;position:absolute;left:-" + _global.RULER_THICKNESS + "px;top:0;width:" + (_global.rulerBarsConfig.top.size + _global.RULER_THICKNESS - _global.rulerBarsConfig.top.startPoint) + "px;}";
		} else {
			guideDefinition = ".tempGuideVertical{border:none;transform:scaleX(2.0);border-left:1px solid " + _global.rulerBarsConfig.tempGuideColor + ";pointer-events:none;position:absolute;left:0;top:-" + _global.RULER_THICKNESS + "px;height:" + (_global.rulerBarsConfig.left.size + _global.RULER_THICKNESS - _global.rulerBarsConfig.left.startPoint) + "px;}";
			guideDefinition += "\n.verticalGuideLine{border:none;transform:scaleX(2.0);border-left:1px solid " + _global.rulerBarsConfig.guideColor + ";pointer-events:none;position:absolute;left:0;top:-" + _global.RULER_THICKNESS + "px;height:" + (_global.rulerBarsConfig.left.size + _global.RULER_THICKNESS - _global.rulerBarsConfig.left.startPoint) + "px;}";
		}
		Util.applyCSSRule(guideDefinition, "guideDefinition_" + config.side);

		ruler.appendChild((config.side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE);
		ruler.style.zIndex = _global.rulerBarsConfig.zIndex;

		var outerBorderDefinition = "";
		outerBorderDefinition += ".topRulerOuterBorder, .rulerBG_top {border-top:" + _global.rulerBarsConfig.outerBorderThickness + " solid " + _global.rulerBarsConfig.outerBorderColor + ";}";
		outerBorderDefinition += ".leftRulerOuterBorder, .rulerBG_left {border-left:" + _global.rulerBarsConfig.outerBorderThickness + " solid " + _global.rulerBarsConfig.outerBorderColor + ";}";
		Util.applyCSSRule(outerBorderDefinition, "outerBorderDefinition");

		ruler.addEventListener("mousedown", function(e) {
			rulerMouseDown(e, config, ruler);
		}, false);
		ruler.addEventListener("mousemove", function(e) {
			rulerMouseMove(e, config, ruler);
		}, false);
		ruler.addEventListener("mouseup", function(e) {
			rulerMouseUp(e, config, ruler);
		}, false);
		ruler.addEventListener("mouseover", function(e) {
			rulerMouseOver(e, config, ruler);
		}, false);
		ruler.addEventListener("mouseout", function(e) {
			rulerMouseOut(e, config, ruler);
		}, false);
		ruler.addEventListener("click", function(e) {
			rulerClick(e, config, ruler);
		}, false);

		return ruler;
	};

	var adjustGuidePosition = function(e, config, ruler, rulerHovered) {
		var offsetProp = (config.side === "top") ? "offsetX" : "offsetY";
		var direction = (config.side === "top") ? "left" : "top";
		var tmpGuide = (config.side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE;
		var offset = (rulerHovered) ? _global.RULER_THICKNESS : 0;
		var guidePosition = Math.ceil(e[offsetProp] - offset) + ((_global.rulerBarsConfig[config.side].startPoint % _global.unitSize) - _global.unitSize);
		var startPoint = _global.rulerBarsConfig[config.side]["startPoint"];

		var ranges = getGuideRange(config.side);
		var rangeStart = ranges[0];
		var rangeEnd = ranges[1];

		var startDelta = 0;
		if (startPoint > 0 && startPoint % 10 !== 0) {
			startDelta = startPoint % 10;
		}
		var endDelta = (rangeStart % _global.unitSize);
		if (startPoint > 0 && startPoint % 10 !== 0) {
			endDelta = endDelta - (startPoint % 10);
		}

		tmpGuide.classList.add("invisible");
		if (_global.activeGuide) {
			_global.activeGuide.guideLine.style[direction] = guidePosition + "px";
			if ((startPoint % 10 === 0 && guidePosition < (rangeStart + startDelta)) || (startPoint % 10 !== 0 && guidePosition < (rangeStart + startDelta + startPoint % 10)) || (rangeEnd !== _global.UNSET && guidePosition > (rangeEnd - endDelta))) {
				_global.activeGuide.guideLine.classList.add("invisible");
				ruler.classList.remove("guideEnabled");
			} else {
				_global.activeGuide.guideLine.classList.remove("invisible");
				ruler.classList.add("guideEnabled");
			}
		}
	};

	var rulerMouseDown = function(e, config, ruler) {
		_global.rulerBarsConfig.parent.classList.add("noselect");
		if (!_global.guides) {
			return;
		}
		var offsetProp = (config.side === "top") ? "offsetX" : "offsetY";
		var startPoint = _global.rulerBarsConfig[config.side].startPoint;
		var guidePosition = Math.ceil(e[offsetProp] - _global.RULER_THICKNESS) + startPoint + (startPoint % _global.unitSize) + "px";
		if (_global[config.side + "Guides"][guidePosition]) {
			_global.activeGuide = _global[config.side + "Guides"][guidePosition].guide;
		}
	};

	var rulerMouseMove = function(e, config, ruler) {
		if (!_global.guides) {
			return;
		}
		var tmpGuide = (config.side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE;
		if (_global.activeGuide) {
			adjustGuidePosition(e, config, ruler, true);
		} else {
			tmpGuide.classList.remove("invisible");
			showTemporaryGuide(e, config.side);
		}
	};

	var rulerMouseUp = function(e, config, ruler) {
		_global.rulerBarsConfig.parent.classList.remove("noselect");
		if (!_global.guides) {
			return;
		}
		var offsetProp = (config.side === "top") ? "offsetX" : "offsetY";
		var ranges = getGuideRange(config.side);
		var rangeStart = ranges[0];
		var rangeEnd = ranges[1];

		var startBoundary = (_global.RULER_THICKNESS + rangeStart);
		var endBoundary = (_global.RULER_THICKNESS + rangeEnd);

		if (_global.activeGuide) {
			_global.activeGuide.destroy();
			_global.activeGuide = null;

			if ((config.side === "top" && Math.ceil(e.offsetX) < startBoundary) || (config.side === "left" && Math.ceil(e.offsetY) < startBoundary)) {
				return;
			}
			if (rangeEnd !== _global.UNSET && ((config.side === "top" && Math.ceil(e.offsetX) > endBoundary) || (config.side === "left" && Math.ceil(e.offsetY) > endBoundary))) {
				return;
			}
			var currentPosition = (Math.ceil(e[offsetProp] - _global.RULER_THICKNESS) - _global.unitSize);
			if (currentPosition < rangeStart || (rangeEnd !== _global.UNSET && currentPosition > rangeEnd)) {
				return;
			}
			new Guide(e, config, ruler);
		}
	};

	var rulerMouseOver = function(e, config, ruler) {
		if (_global.activeGuide && !ruler.querySelector("#" + _global.activeGuide.guideLine.id)) {
			_global.activeGuide.destroy();
			_global.activeGuide = null;
		}
	};

	var rulerMouseOut = function(e, config, ruler) {
		_global.rulerBarsConfig.parent.classList.remove("noselect");
		if (_global.activeGuide) {
			adjustGuidePosition(e, config, ruler, false);
		}
		var tmpGuide = (config.side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE;
		tmpGuide.classList.add("invisible");
	};

	var rulerClick = function(e, config, ruler) {
		if (!_global.guides) {
			return;
		}
		var offsetProp = (config.side === "top") ? "offsetX" : "offsetY";
		var ranges = getGuideRange(config.side);
		var rangeStart = ranges[0];
		var rangeEnd = ranges[1];

		var startBoundary = (_global.RULER_THICKNESS + _global.unitSize + rangeStart);
		var endBoundary = (_global.RULER_THICKNESS + _global.unitSize + rangeEnd);
		if ((config.side === "top" && Math.ceil(e.offsetX) < startBoundary) || (config.side === "left" && Math.ceil(e.offsetY) < startBoundary)) {
			return;
		}
		if (rangeEnd !== _global.UNSET && ((config.side === "top" && Math.ceil(e.offsetX) > endBoundary) || (config.side === "left" && Math.ceil(e.offsetY) > endBoundary))) {
			return;
		}
		var currentPosition = (Math.ceil(e[offsetProp] - _global.RULER_THICKNESS) - _global.unitSize);
		if (currentPosition < rangeStart || (rangeEnd !== _global.UNSET && currentPosition > rangeEnd)) {
			return;
		}

		new Guide(e, config, ruler);
	};

	/**
	 * Remove the rulers from DOM
	 */
	RulerBars.prototype.destroy = function() {
		if (_global.rulerBarsConfig && _global.rulerBarsConfig.parent) {
			_global.rulerBarsConfig.parent.classList.remove("noselect");
		}
		var rulerElements = document.querySelectorAll(".ruler, .rulerCornerBox, .rulerOuterBorder");
		[].forEach.call(rulerElements, function(rulerElem) {
			rulerElem.parentNode.removeChild(rulerElem);
		});
		_global.rulerBarsCreated = false;
		_global.rulerBarsConfig = null;
		Util.resetGlobal();
	};

	/**
	 * Show the hidden rulers by removing css class "invisible".
	 */
	RulerBars.prototype.showRulers = function() {
		var rulerElements = document.querySelectorAll(".ruler, .rulerCornerBox, .rulerOuterBorder");
		[].forEach.call(rulerElements, function(rulerElem) {
			rulerElem.classList.remove("invisible");
		});
		_global.rulersHidden = false;
	};

	/**
	 * Hide the rulers by adding css class "invisible".
	 */
	RulerBars.prototype.hideRulers = function() {
		var rulerElements = document.querySelectorAll(".ruler, .rulerCornerBox, .rulerOuterBorder");
		[].forEach.call(rulerElements, function(rulerElem) {
			rulerElem.classList.add("invisible");
		});
		_global.rulersHidden = true;
	};

	/**
	 * Determine whether the RulerBars are visible.
	 */
	RulerBars.prototype.isVisible = function() {
		return !(!!_global.rulersHidden);
	};

	/**
	 * Enable the guides functionality for rulers.
	 */
	RulerBars.prototype.enableGuides = function() {
		_global.guides = true;
		[].forEach.call(document.querySelectorAll(".rulerBar"), function(rulerBar) {
			rulerBar.classList.add("guideEnabled");
		});
		[].forEach.call(document.querySelectorAll(".rulerGuideLine"), function(guideLine) {
			guideLine.classList.remove("invisible");
		});
	};

	/**
	 * Disable the guides functionality for rulers.
	 */
	RulerBars.prototype.disableGuides = function() {
		_global.guides = false;
		[].forEach.call(document.querySelectorAll(".rulerBar"), function(rulerBar) {
			rulerBar.classList.remove("guideEnabled");
		});
		[].forEach.call(document.querySelectorAll(".rulerGuideLine"), function(guideLine) {
			guideLine.classList.add("invisible");
		});
	};

	/**
	 * Determine if Guides are enabled
	 */
	RulerBars.prototype.isGuidesEnabled = function() {
		return Boolean(_global.guides);
	};

	/**
	 * Clear all the guides functionality for rulers.
	 */
	RulerBars.prototype.clearGuides = function() {
		_global.activeGuide = null;
		_global.topGuides = {};
		_global.leftGuides = {};
		[].forEach.call(document.querySelectorAll(".rulerGuideLine"), function(guideLine) {
			guideLine.parentNode.removeChild(guideLine);
		});
	};

	var getGuideRange = function(side) {
		var startPoint = _global.rulerBarsConfig[side]["startPoint"];
		var rangeStart = startPoint || 0;
		if (rangeStart > 0) {
			rangeStart = 0;
		} else {
			rangeStart = Math.abs(rangeStart);
		}
		var rangeEnd = _global.UNSET;
		if (side === "top" && _global.elementWidth) {
			rangeEnd = rangeStart + _global.elementWidth;
		}
		if (side === "left" && _global.elementHeight) {
			rangeEnd = rangeStart + _global.elementHeight;
		}
		if (rangeEnd !== _global.UNSET && startPoint > 0) {
			rangeEnd = rangeEnd - startPoint;
		}
		return [ rangeStart, rangeEnd ];
	};

	var showTemporaryGuide = function(e, side) {
		if (!_global.guides) {
			return;
		}
		var tmpGuide = (side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE;
		var currentRuler = (side === "top") ? _global.topRuler : _global.leftRuler;
		var direction = (side === "top") ? "left" : "top";
		var offsetProp = (side === "top") ? "offsetX" : "offsetY";

		var ranges = getGuideRange(side);
		var rangeStart = ranges[0];
		var rangeEnd = ranges[1];

		var other = (side === "top") ? "left" : "top";
		tmpGuide.classList.remove("invisible");

		var adjustedPosition = (_global.rulerBarsConfig[side].startPoint % _global.unitSize) - _global.unitSize;
		tmpGuide.style[direction] = Math.ceil(e[offsetProp] - _global.RULER_THICKNESS + adjustedPosition) + "px";

		var currentPosition = (Math.ceil(e[offsetProp] - _global.RULER_THICKNESS) - _global.unitSize);
		if (currentPosition < rangeStart || (rangeEnd !== _global.UNSET && currentPosition > rangeEnd)) {
			tmpGuide.classList.add("invisible");
		}

		if (currentPosition < rangeStart || (rangeEnd !== _global.UNSET && currentPosition > rangeEnd)) {
			currentRuler.classList.remove("guideEnabled");
		} else {
			currentRuler.classList.add("guideEnabled");
		}
	};

	RulerBars.prototype.zoom = function(scale) {
		if (!scale || isNaN(scale)) {
			scale = 1;
		}
		_global.zoomVal = scale;
		if (!_global.rulerBarsCreated || !_global.topRuler || !_global.leftRuler) {
			return;
		}
		/* default thickness scale = 2 */
		var guideLineThicknessScale = (2 / scale);
		var horizontalGuideLineSize = ((_global.rulerBarsConfig.top.size - _global.rulerBarsConfig.top.startPoint) * scale) + _global.RULER_THICKNESS;
		var verticalGuideLineSize = ((_global.rulerBarsConfig.left.size - _global.rulerBarsConfig.left.startPoint) * scale) + _global.RULER_THICKNESS;

		var rulerZoomConfig = "";
		rulerZoomConfig += ".verticalGuideLine{transform-origin:0 0;height:" + verticalGuideLineSize + "px;transform:scale(" + guideLineThicknessScale + ",1);}";
		rulerZoomConfig += "\n.tempGuideVertical{transform-origin:0 0;height:" + verticalGuideLineSize + "px;transform:scale(" + guideLineThicknessScale + ",1);}";
		rulerZoomConfig += "\n.horizontalGuideLine{transform-origin:0 0;width:" + horizontalGuideLineSize + "px;transform:scale(1," + guideLineThicknessScale + ");}";
		rulerZoomConfig += "\n.tempGuideHorizontal{transform-origin:0 0;width:" + horizontalGuideLineSize + "px;transform:scale(1," + guideLineThicknessScale + ");}";
		rulerZoomConfig += "\n.ruler.top .big,.ruler.top .medium,.ruler.top .small{transform-origin:0 0;transform:scaleX(" + (1 / scale) + ");}";
		rulerZoomConfig += "\n.ruler.left .big, .ruler.left .medium, .ruler.left .small{transform-origin:0 0;transform:scaleY(" + (1 / scale) + ");}";
		Util.applyCSSRule(rulerZoomConfig, "rulerZoomConfig");

		_global.topRuler.style.transformOrigin = "0 0";
		_global.topRuler.style.transform = "scaleX(" + scale + ")";
		_global.leftRuler.style.transformOrigin = "0 0";
		_global.leftRuler.style.transform = "scaleY(" + scale + ")";

		_global.topRulerOuterBorder.style.transformOrigin = "0 0";
		_global.topRulerOuterBorder.style.transform = "scaleX(" + (scale) + ")";
		_global.leftRulerOuterBorder.style.transformOrigin = "0 0";
		_global.leftRulerOuterBorder.style.transform = "scaleY(" + (scale) + ")";
	};

	/**
	 * Get the RulerBars current configuration.
	 */
	RulerBars.prototype.getConfig = function() {
		try {
			var obj = JSON.parse(JSON.stringify(_global.rulerBarsConfig));
			obj.parent = _global.rulerBarsConfig.parent;
			obj.element = _global.rulerBarsConfig.element;
			return obj;
		} catch (exjs) {
			return _global.rulerBarsConfig;
		}
	};

	/**
	 * Update the top & left rulers by supplying a configuration object.
	 * 
	 * @cfg: configuration for updating the rulers - same as the cfg for createRulers
	 */
	RulerBars.prototype.updateRulers = function(cfg) {
		if (!_global.rulerBarsCreated) {
			throw new Error("RulerBars does not exist, use createRulers instead of updateRulers.");
		}
		if (!cfg || !cfg.top || !cfg.left) {
			throw new Error("\nMissing Configuration !!\n{\n\ttop: {...},\n\tleft: {...}\n}\n");
		}
		var _cachedTopGuides = _global.topGuides;
		var _cachedLeftGuides = _global.leftGuides;
		var _cachedZoomVal = _global.zoomVal || 1;
		var _cachedTopStartPoint = _global.rulerBarsConfig.top.startPoint || 0;
		var _cachedLeftStartPoint = _global.rulerBarsConfig.left.startPoint || 0;
		var _cachedIsGuidesEnabled = _global.guides;
		var isVisible = this.isVisible();
		_global.rulerBarsCreated = false;
		this.createRulers(cfg);
		_global.guides = _cachedIsGuidesEnabled;

		var topGuide, leftGuide, delta, simulatedEvent, _newGuide;
		var topStartPoint = cfg.top.startPoint || 0;
		var leftStartPoint = cfg.left.startPoint || 0;
		for (topGuide in _cachedTopGuides) {
			var guideEntry = _cachedTopGuides[topGuide];
			if (guideEntry && guideEntry.setByUser) {
				delta = _cachedTopStartPoint - topStartPoint;
				simulatedEvent = {};
				simulatedEvent[guideEntry.guide.offsetProp] = guideEntry.guide[guideEntry.guide.offsetProp] + delta;
				_newGuide = new Guide(simulatedEvent, _global.rulerBarsConfig.top, _global.topRuler);
				if ((simulatedEvent[guideEntry.guide.offsetProp] < (_global.RULER_THICKNESS + _global.unitSize)) || ((-1 * topStartPoint) > _global.RULER_THICKNESS && simulatedEvent[guideEntry.guide.offsetProp] < topStartPoint) || (topStartPoint < _global.RULER_THICKNESS && (simulatedEvent[guideEntry.guide.offsetProp] - topStartPoint - (topStartPoint % 10)) <= _global.RULER_THICKNESS)) {
					_newGuide.guideLine.classList.add("invisible");
				}
			}
		}
		for (leftGuide in _cachedLeftGuides) {
			var guideEntry = _cachedLeftGuides[leftGuide];
			if (guideEntry && guideEntry.setByUser) {
				delta = _cachedLeftStartPoint - leftStartPoint;
				simulatedEvent = {};
				simulatedEvent[guideEntry.guide.offsetProp] = guideEntry.guide[guideEntry.guide.offsetProp] + delta;
				_newGuide = new Guide(simulatedEvent, _global.rulerBarsConfig.left, _global.leftRuler);
				if ((simulatedEvent[guideEntry.guide.offsetProp] < (_global.RULER_THICKNESS + _global.unitSize)) || ((-1 * leftStartPoint) > _global.RULER_THICKNESS && simulatedEvent[guideEntry.guide.offsetProp] < leftStartPoint) || (leftStartPoint < _global.RULER_THICKNESS && (simulatedEvent[guideEntry.guide.offsetProp] - leftStartPoint - (leftStartPoint % 10)) <= _global.RULER_THICKNESS)) {
					_newGuide.guideLine.classList.add("invisible");
				}
			}
		}

		this.zoom(_cachedZoomVal);
		if (!isVisible) {
			this.hideRulers();
		}
	};

	/**
	 * Create the top & left rulers by supplying a configuration object.
	 * 
	 * @cfg: configuration for creating the rulers.
	 * @cfg.top: Configuration for Top Ruler See config param for getRuler()
	 * @cfg.left: Configuration for Left Ruler See config param for getRuler()
	 * @cfg.parent: The parent container where the Rulers need to be appended.
	 * @cfg.element: The element of interest for the Ruler, helps in defining the outer boundaries for the Guide.
	 * @cfg.elementWidth: The width of element, helps in determining the boundary for Guides for Top Ruler.
	 * @cfg.elementHeight: The height of element, helps in determining the boundary for Guides for Left Ruler.
	 * @cfg.backgroundColor: The background color for the Rulers.
	 * @cfg.foregroundColor: The foreground color for the Rulers.
	 * @cfg.unitFontColor: The font color for unit text.
	 * @cfg.smallMediumEqual: Boolean value indicating that small & medium units display as medium.
	 * @cfg.tempGuideColor: The color for the temporary Guide.
	 * @cfg.guideColor: The color for the Guide (which has been dropped on the ruler)
	 * @cfg.zIndex: The zIndex value for the Rulers.
	 * @cfg.outerBorderColor: The color of outer border.
	 * @cfg.outerBorderThickness: The width of outer border in pixels.
	 * @cfg.hideFirstUnitOnScale: Boolean -> Hide the first unit on the scale if the startPoint is not exactly divisible by 10
	 */
	RulerBars.prototype.createRulers = function(cfg) {
		if (_global.rulerBarsCreated) {
			throw new Error("RulerBars already created. use updateRulers instead of createRulers.");
		}
		if (!cfg || !cfg.top || !cfg.left) {
			throw new Error("\nMissing Configuration !!\n{\n\ttop: {...},\n\tleft: {...}\n}\n");
		}
		var _cachedZoomVal = _global.zoomVal || 1;
		/* Destroy existing Rulers */
		this.destroy();
		if (cfg.element && typeof cfg.element.offsetWidth === "number" && typeof cfg.element.offsetHeight === "number") {
			_global.elementWidth = !isNaN(cfg.elementWidth) ? cfg.elementWidth : cfg.element.offsetWidth;
			_global.elementHeight = !isNaN(cfg.elementHeight) ? cfg.elementHeight : cfg.element.offsetHeight;
		} else {
			_global.elementWidth = 0;
			_global.elementHeight = 0;
		}
		_global.rulerBarsConfig = Util.createConfig(cfg);
		_global.rulerBarsConfig.parent = cfg.parent || document.querySelector("body");
		_global.rulerBarsConfig.element = cfg.element;

		_global.rulerBarsConfig.zIndex = !isNaN(_global.rulerBarsConfig.zIndex) ? _global.rulerBarsConfig.zIndex : 0;
		_global.rulerBarsConfig.top.side = "top";
		_global.rulerBarsConfig.left.side = "left";

		_global.topRuler = getRuler(_global.rulerBarsConfig.top);
		_global.leftRuler = getRuler(_global.rulerBarsConfig.left);

		var rulerCorner = document.createElement("div");
		rulerCorner.className = "rulerCornerBox";
		rulerCorner.style.width = rulerCorner.style.height = (_global.RULER_THICKNESS - 2) + "px";
		rulerCorner.style.backgroundColor = _global.rulerBarsConfig.backgroundColor;
		rulerCorner.style.position = "absolute";
		rulerCorner.style.top = rulerCorner.style.left = "0px";
		_global.rulerBarsConfig.parent.appendChild(rulerCorner);

		_global.rulerBarsConfig.parent.appendChild(_global.topRuler);
		_global.rulerBarsConfig.parent.appendChild(_global.leftRuler);

		_global.topRulerOuterBorder = document.createElement("div");
		_global.topRulerOuterBorder.className = "rulerOuterBorder topRulerOuterBorder";
		_global.topRulerOuterBorder.style.position = "absolute";
		_global.topRulerOuterBorder.style.top = 0;
		_global.topRulerOuterBorder.style.left = 0;
		_global.topRulerOuterBorder.style.right = 0;
		_global.topRulerOuterBorder.style.maxWidth = (parseInt(getComputedStyle(_global.topRuler.querySelector(".rulerBG"), null)["width"], 10) - 20) + "px";
		_global.topRulerOuterBorder.style.zIndex = _global.rulerBarsConfig.zIndex + 2;
		_global.rulerBarsConfig.parent.appendChild(_global.topRulerOuterBorder);

		_global.leftRulerOuterBorder = document.createElement("div");
		_global.leftRulerOuterBorder.className = "rulerOuterBorder leftRulerOuterBorder";
		_global.leftRulerOuterBorder.style.position = "absolute";
		_global.leftRulerOuterBorder.style.top = 0;
		_global.leftRulerOuterBorder.style.left = 0;
		_global.leftRulerOuterBorder.style.bottom = 0;
		_global.leftRulerOuterBorder.style.maxHeight = (parseInt(getComputedStyle(_global.leftRuler.querySelector(".rulerBG"), null)["height"], 10) - 20) + "px";
		_global.leftRulerOuterBorder.style.zIndex = _global.rulerBarsConfig.zIndex + 2;
		_global.rulerBarsConfig.parent.appendChild(_global.leftRulerOuterBorder);

		_global.rulerBarsCreated = true;
		this.zoom(_cachedZoomVal);
	};

})(window);
