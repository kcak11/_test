/**
 * Copyright(c) - 2019 Ashish's Web
 * 
 * Author: K.C.Ashish Kumar https://kcak11.com (or) https://ashishkumarkc.com
 * 
 * Repository: https://github.com/kcak11/pens
 */

(function(w) {
	var _global = {};
	_global.RULER_THICKNESS = 30;
	_global.topGuides = {};
	_global.leftGuides = {};

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
			_global.HORIZONTAL_TEMPORARY_GUIDE = document.createElement("div");
			_global.HORIZONTAL_TEMPORARY_GUIDE.className = "tempGuideHorizontal tempGuide invisible";
			_global.VERTICAL_TEMPORARY_GUIDE = document.createElement("div");
			_global.VERTICAL_TEMPORARY_GUIDE.className = "tempGuideVertical tempGuide invisible";
		}
	};

	/**
	 * Guide constructor
	 * 
	 * @evt: The event object
	 * @config: The ruler config object
	 * @ruler: The ruler DOM element
	 */
	var Guide = function(evt, config, ruler) {
		if (!(this instanceof Guide)) {
			throw new Error("Guide is a constructor, use the \"new\" operator to create new instance.");
		}
		var _this = this;
		var startPoint = _global.rulerBarsConfig[config.side].startPoint;
		this.side = config.side;
		this.offsetProp = (this.side === "top") ? "offsetX" : "offsetY";
		this.positionVal = Math.ceil(evt[this.offsetProp] - _global.RULER_THICKNESS) + ((_global.rulerBarsConfig[this.side].startPoint % 10) - _global.unitSize);
		this.guidePosition = this.positionVal + "px";
		var entry = this.positionVal + startPoint + _global.unitSize;
		if (_global[this.side + "Guides"][entry + "px"] || entry < (_global.unitSize + (startPoint % 10))) {
			return;
		}
		this.direction = (this.side === "top") ? "left" : "top";
		this.guideLine = document.createElement("div");
		this.guideLine.id = "guide_" + Util.getUniqueID();
		this.guideLine.className = "rulerGuideLine " + ((this.side === "top") ? "verticalGuideLine" : "horizontalGuideLine");
		this.guideLine.style[this.direction] = this.guidePosition;
		var entry = this.positionVal + startPoint + _global.unitSize;
		_global[this.side + "Guides"][(entry - 2) + "px"] = this;
		_global[this.side + "Guides"][(entry - 1) + "px"] = this;
		_global[this.side + "Guides"][entry + "px"] = this;
		_global[this.side + "Guides"][(entry + 1) + "px"] = this;
		_global[this.side + "Guides"][(entry + 2) + "px"] = this;
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
		config.side = (config.side === "left") ? config.side : "top";
		config.size = parseInt(config.size, 10) || 100;
		_global.rulerBarsConfig.tempGuideColor = _global.rulerBarsConfig.tempGuideColor || "#ffaaab";
		_global.rulerBarsConfig.guideColor = _global.rulerBarsConfig.guideColor || "#ff0400";
		if (isNaN(config.size) || config.size < 0) {
			throw new Error("Invalid size parameter specified " + config.size + ". Expected positive number.");
		}
		config.startPoint = parseInt(config.startPoint, 10) || 0;
		if (isNaN(config.startPoint)) {
			throw new Error("Invalid startPoint specified, expected number.");
		}
		var startPointDelta = config.startPoint % 10;
		var rulerThickness = _global.RULER_THICKNESS;
		var ruler = document.createElement("div");
		ruler.className = "rulerBar ruler " + config.side;
		var rulerBG = document.createElement("div");
		rulerBG.className = "rulerBG rulerBG_" + config.side;
		rulerBG.style.backgroundColor = _global.rulerBarsConfig.backgroundColor;
		ruler.appendChild(rulerBG);
		var big = document.createElement("div");
		big.className = "big";
		var medium = document.createElement("div");
		medium.className = "medium";
		var small = document.createElement("div");
		small.className = "small";
		var units = [ big, medium, small ];
		var iterations = Math.ceil(config.size / 10);
		for (var i = Math.ceil(config.startPoint / 10), ctr = 0; i <= iterations; i++) {
			var unit;
			if (Math.abs(i) % 10 === 0) {
				unit = big.cloneNode(true);
				unit.setAttribute("unit-value", (i * 10));
			} else if (Math.abs(i) % 2 === 1) {
				unit = small.cloneNode(true);
			} else if (Math.abs(i) % 2 === 0) {
				unit = medium.cloneNode(true);
			}
			unit.style[config.side === "top" ? "left" : "top"] = (ctr * _global.unitSize) + "px";
			if (ctr === 0 && startPointDelta !== 0) {
				unit.style.visibility = "hidden";
			}
			ruler.appendChild(unit);
			ctr++;
		}
		ruler.style[config.side === "top" ? "width" : "height"] = ((ctr * _global.unitSize) - _global.unitSize) + "px";

		ruler.style[config.side === "top" ? "left" : "top"] = (rulerThickness - startPointDelta) + "px";
		rulerBG.style[config.side === "top" ? "width" : "height"] = ((ctr * _global.unitSize) + rulerThickness - startPointDelta) + "px";
		rulerBG.style[config.side === "top" ? "border-bottom" : "border-right"] = "1px solid " + _global.rulerBarsConfig.foregroundColor;
		rulerBG.style[config.side === "top" ? "height" : "width"] = rulerThickness + "px";
		rulerBG.style[config.side === "top" ? "top" : "left"] = (-1 * rulerThickness) + "px";
		rulerBG.style[config.side === "top" ? "left" : "top"] = (-1 * (rulerThickness - startPointDelta + _global.unitSize)) + "px";

		var colorDefinitionTop = ".ruler.top, .ruler.top .big, .ruler.top .medium, .ruler.top .small{border-color: {{fgColor}};color: {{fgColor}};}";
		var colorDefinitionLeft = ".ruler.left, .ruler.left .big, .ruler.left .medium, .ruler.left .small  {border-color: {{fgColor}};color: {{fgColor}};}";
		var colorDefinition = (config.side === "top") ? colorDefinitionTop : colorDefinitionLeft;
		colorDefinition = colorDefinition.split("{{fgColor}}").join(_global.rulerBarsConfig.foregroundColor);
		Util.applyCSSRule(colorDefinition, "rulerCSS_" + config.side);

		var guideDefinition;
		if (config.side === "left") {
			guideDefinition = ".tempGuideHorizontal{border:none;transform:scaleY(2.0);border-top:1px solid " + _global.rulerBarsConfig.tempGuideColor + ";pointer-events:none;position:absolute;left:-" + _global.RULER_THICKNESS + "px;top:0;width:" + (this.TOP_RULER_SIZE + _global.RULER_THICKNESS - _global.rulerBarsConfig.top.startPoint) + "px;}";
			guideDefinition += "\n.horizontalGuideLine{border:none;transform:scaleY(2.0);border-top:1px solid " + _global.rulerBarsConfig.guideColor + ";pointer-events:none;position:absolute;left:-" + _global.RULER_THICKNESS + "px;top:0;width:" + (this.TOP_RULER_SIZE + _global.RULER_THICKNESS - _global.rulerBarsConfig.top.startPoint) + "px;}";
		} else {
			guideDefinition = ".tempGuideVertical{border:none;transform:scaleX(2.0);border-left:1px solid " + _global.rulerBarsConfig.tempGuideColor + ";pointer-events:none;position:absolute;left:0;top:-" + _global.RULER_THICKNESS + "px;height:" + (this.LEFT_RULER_SIZE + _global.RULER_THICKNESS - _global.rulerBarsConfig.left.startPoint) + "px;}";
			guideDefinition += "\n.verticalGuideLine{border:none;transform:scaleX(2.0);border-left:1px solid " + _global.rulerBarsConfig.guideColor + ";pointer-events:none;position:absolute;left:0;top:-" + _global.RULER_THICKNESS + "px;height:" + (this.LEFT_RULER_SIZE + _global.RULER_THICKNESS - _global.rulerBarsConfig.left.startPoint) + "px;}";
		}
		Util.applyCSSRule(guideDefinition, "guideDefinition_" + config.side);

		ruler.appendChild((config.side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE);

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
		var guidePosition = Math.ceil(e[offsetProp] - offset) + ((_global.rulerBarsConfig[config.side].startPoint % 10) - _global.unitSize);
		var rangeStart = _global.rulerBarsConfig[config.side]["startPoint"] || 0;
		if (rangeStart > 0) {
			rangeStart = 0;
		} else {
			rangeStart = Math.abs(rangeStart);
		}
		tmpGuide.classList.add("invisible");
		if (_global.activeGuide) {
			_global.activeGuide.guideLine.style[direction] = guidePosition + "px";
			if (guidePosition < rangeStart) {
				_global.activeGuide.guideLine.classList.add("invisible");
				ruler.classList.remove("guideEnabled");
			} else {
				_global.activeGuide.guideLine.classList.remove("invisible");
				ruler.classList.add("guideEnabled");
			}
		}
	};

	var rulerMouseDown = function(e, config, ruler) {
		this.rulerParent.classList.add("noselect");
		if (!this.guides) {
			return;
		}
		var offsetProp = (config.side === "top") ? "offsetX" : "offsetY";
		var startPoint = _global.rulerBarsConfig[config.side].startPoint;
		var guidePosition = Math.ceil(e[offsetProp] - _global.RULER_THICKNESS) + startPoint + (startPoint % 10) + "px";
		if (_global[config.side + "Guides"][guidePosition]) {
			_global.activeGuide = _global[config.side + "Guides"][guidePosition];
		}
	};

	var rulerMouseMove = function(e, config, ruler) {
		if (!this.guides) {
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
		this.rulerParent.classList.remove("noselect");
		if (!this.guides) {
			return;
		}
		var rangeStart = _global.rulerBarsConfig[config.side]["startPoint"] || 0;
		if (rangeStart > 0) {
			rangeStart = 0;
		} else {
			rangeStart = Math.abs(rangeStart);
		}
		if (_global.activeGuide) {
			_global.activeGuide.destroy();
			_global.activeGuide = null;
			if ((config.side === "top" && Math.ceil(e.offsetX) < (_global.RULER_THICKNESS + rangeStart)) || (config.side === "left" && Math.ceil(e.offsetY) < (_global.RULER_THICKNESS + rangeStart))) {
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
		this.rulerParent.classList.remove("noselect");
		if (_global.activeGuide) {
			adjustGuidePosition(e, config, ruler, false);
		}
		var tmpGuide = (config.side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE;
		tmpGuide.classList.add("invisible");
	};

	var rulerClick = function(e, config, ruler) {
		if (!this.guides) {
			return;
		}
		var rangeStart = _global.rulerBarsConfig[config.side]["startPoint"] || 0;
		if (rangeStart > 0) {
			rangeStart = 0;
		} else {
			rangeStart = Math.abs(rangeStart);
		}
		if ((config.side === "top" && Math.ceil(e.offsetX) < (_global.RULER_THICKNESS + _global.unitSize + rangeStart)) || (config.side === "left" && Math.ceil(e.offsetY) < (_global.RULER_THICKNESS + _global.unitSize + rangeStart))) {
			return;
		}
		new Guide(e, config, ruler);
	};

	/**
	 * Remove the rulers from DOM
	 */
	RulerBars.prototype.destroy = function() {
		if (this.rulerParent) {
			this.rulerParent.classList.remove("noselect");
		}
		var rulers = document.querySelectorAll(".ruler");
		[].forEach.call(rulers, function(ruler) {
			ruler.parentNode.removeChild(ruler);
		});
		this.rulerBarsEnabled = false;
		_global.rulerBarsConfig = null;
		Util.resetGlobal();
	};

	/**
	 * Show the hidden rulers by removing css class "invisible".
	 */
	RulerBars.prototype.showRulers = function() {
		var rulers = document.querySelectorAll(".ruler");
		[].forEach.call(rulers, function(ruler) {
			ruler.classList.remove("invisible");
		});
	};

	/**
	 * Hide the rulers by adding css class "invisible"
	 */
	RulerBars.prototype.hideRulers = function() {
		var rulers = document.querySelectorAll(".ruler");
		[].forEach.call(rulers, function(ruler) {
			ruler.classList.add("invisible");
		});
	};

	/**
	 * Enable the guides functionality for rulers.
	 */
	RulerBars.prototype.enableGuides = function() {
		this.guides = true;
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
		this.guides = false;
		[].forEach.call(document.querySelectorAll(".rulerBar"), function(rulerBar) {
			rulerBar.classList.remove("guideEnabled");
		});
		[].forEach.call(document.querySelectorAll(".rulerGuideLine"), function(guideLine) {
			guideLine.classList.add("invisible");
		});
	};

	var showTemporaryGuide = function(evt, side) {
		if (!this.guides) {
			return;
		}
		var tmpGuide = (side === "top") ? _global.VERTICAL_TEMPORARY_GUIDE : _global.HORIZONTAL_TEMPORARY_GUIDE;
		var currentRuler = (side === "top") ? this.topRuler : this.leftRuler;
		var direction = (side === "top") ? "left" : "top";
		var offsetProp = (side === "top") ? "offsetX" : "offsetY";
		var rangeStart = _global.rulerBarsConfig[side]["startPoint"] || 0;
		if (rangeStart > 0) {
			rangeStart = 0;
		} else {
			rangeStart = Math.abs(rangeStart);
		}
		var other = (side === "top") ? "left" : "top";
		tmpGuide.classList.remove("invisible");

		var adjustedPosition = (_global.rulerBarsConfig[side].startPoint % 10) - _global.unitSize;

		tmpGuide.style[direction] = Math.ceil(evt[offsetProp] - _global.RULER_THICKNESS + adjustedPosition) + "px";
		if ((Math.ceil(evt[offsetProp] - _global.RULER_THICKNESS) - _global.unitSize) < rangeStart) {
			tmpGuide.classList.add("invisible");
		}
		if (Math.ceil(evt[offsetProp]) < _global.RULER_THICKNESS) {
			currentRuler.classList.remove("guideEnabled");
		} else {
			currentRuler.classList.add("guideEnabled");
		}
	};

	RulerBars.prototype.zoom = function(scale) {
		if (!this.rulerBarsEnabled || !this.topRuler || !this.leftRuler) {
			return;
		}
		if (isNaN(scale)) {
			scale = 1;
		}
		/* default thickness scale = 2 */
		var guideLineThicknessScale = (2 / scale);
		var horizontalGuideLineSize = ((this.TOP_RULER_SIZE - _global.rulerBarsConfig.top.startPoint) * scale) + _global.RULER_THICKNESS;
		var verticalGuideLineSize = ((this.LEFT_RULER_SIZE - _global.rulerBarsConfig.left.startPoint) * scale) + _global.RULER_THICKNESS;

		var rulerZoomConfig = "";
		rulerZoomConfig += ".verticalGuideLine{transform-origin:0 0;height:" + verticalGuideLineSize + "px;transform:scale(" + guideLineThicknessScale + ",1);}";
		rulerZoomConfig += "\n.tempGuideVertical{transform-origin:0 0;height:" + verticalGuideLineSize + "px;transform:scale(" + guideLineThicknessScale + ",1);}";
		rulerZoomConfig += "\n.horizontalGuideLine{transform-origin:0 0;width:" + horizontalGuideLineSize + "px;transform:scale(1," + guideLineThicknessScale + ");}";
		rulerZoomConfig += "\n.tempGuideHorizontal{transform-origin:0 0;width:" + horizontalGuideLineSize + "px;transform:scale(1," + guideLineThicknessScale + ");}";
		rulerZoomConfig += "\n.ruler.top .big,.ruler.top .medium,.ruler.top .small{transform-origin:0 0;transform:scaleX(" + (1 / scale) + ");}";
		rulerZoomConfig += "\n.ruler.left .big, .ruler.left .medium, .ruler.left .small{transform-origin:0 0;transform:scaleY(" + (1 / scale) + ");}";
		Util.applyCSSRule(rulerZoomConfig, "rulerZoomConfig");

		this.topRuler.style.transformOrigin = "0 0";
		this.topRuler.style.transform = "scaleX(" + scale + ")";
		this.leftRuler.style.transformOrigin = "0 0";
		this.leftRuler.style.transform = "scaleY(" + scale + ")";
	};

	/**
	 * Create the top & left rulers by supplying a configuration object.
	 * 
	 * @cfg: configuration for creating the rulers.
	 * @cfg.top: Configuration for Top Ruler See config param for getRuler()
	 * @cfg.left: Configuration for Left Ruler See config param for getRuler()
	 * @cfg.parent: The parent container where the Rulers need to be appended.
	 * @cfg.element: The element of interest for the Ruler, helps in defining the outer boundaries for the Guide.
	 * @cfg.backgroundColor: The background color for the Rulers.
	 * @cfg.foregroundColor: The foreground color for the Rulers.
	 * @cfg.tempGuideColor: The color for the temporary Guide.
	 * @cfg.guideColor: The color for the Guide (which has been dropped on the ruler)
	 */
	RulerBars.prototype.createRulers = function(cfg) {
		if (!cfg || !cfg.top || !cfg.left) {
			return;
		}
		Util.resetGlobal();
		if (cfg.element && typeof cfg.element.offsetWidth === "number" && typeof cfg.element.offsetHeight === "number") {
			_global.rulerMaxRight = cfg.element.offsetWidth;
			_global.rulerMaxBottom = cfg.element.offsetHeight;
		}
		_global.rulerBarsConfig = Util.createConfig(cfg);
		_global.rulerBarsConfig.parent = _global.rulerBarsConfig.parent || document.querySelector("body");

		this.TOP_RULER_SIZE = _global.rulerBarsConfig.top.size;
		this.LEFT_RULER_SIZE = _global.rulerBarsConfig.left.size;

		_global.rulerBarsConfig.top.side = "top";
		_global.rulerBarsConfig.left.side = "left";

		this.topRuler = getRuler(_global.rulerBarsConfig.top);
		this.leftRuler = getRuler(_global.rulerBarsConfig.left);

		this.rulerParent = _global.rulerBarsConfig.parent;

		var rulerCorner = document.createElement("div");
		rulerCorner.style.width = rulerCorner.style.height = (_global.RULER_THICKNESS - 2) + "px";
		rulerCorner.style.backgroundColor = _global.rulerBarsConfig.backgroundColor;
		rulerCorner.style.position = "absolute";
		rulerCorner.style.top = rulerCorner.style.left = "0px";
		_global.rulerBarsConfig.parent.appendChild(rulerCorner);

		_global.rulerBarsConfig.parent.appendChild(this.topRuler);
		_global.rulerBarsConfig.parent.appendChild(this.leftRuler);

		this.rulerBarsEnabled = true;
	};

})(window);