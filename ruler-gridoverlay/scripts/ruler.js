/**
  Copyright(c) - 2019 Ashish's Web
  Author: K.C.Ashish Kumar
  https://kcak11.com (or) https://ashishkumarkc.com
  Repository: https://github.com/kcak11/pens
*/

(function(w) {
    var global = {};
    global.RULER_THICKNESS = 30;
    global.topGuides = {};
    global.leftGuides = {};

    /**
      Utility functions
    */
    var Util = {
        applyCSSRule: function(defn, id) {
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
        copyConfig: function(config) {
            try {
                return JSON.parse(JSON.stringify(config));
            } catch (exjs) {
                return config;
            }
        },
        getUniqueID: function() {
            var chars = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return chars.split("").sort(function() {
                return Math.random() - Math.random();
            }).join("");
        },
        bindFunc: function(func, ctx) {
            return function() {
                return func.apply(ctx, arguments);
            }
        }
    };

    /**
      Guide constructor
      @evt: The event object
      @config: The ruler config object
      @ruler: The ruler DOM element
    */
    var Guide = function(evt, config, ruler) {
        if (!(this instanceof Guide)) {
            throw new Error("Guide is a constructor, use the \"new\" operator to create new instance.");
        }
        var _this = this;
        this.side = config.side;
        this.offsetProp = (this.side === "top") ? "offsetX" : "offsetY";
        this.positionVal = Math.ceil(evt[this.offsetProp] - global.RULER_THICKNESS);
        this.guidePosition = this.positionVal + "px";
        if (global[this.side + "Guides"][this.guidePosition]) {
            return;
        }
        this.direction = (this.side === "top") ? "left" : "top";
        this.guideLine = document.createElement("div");
        this.guideLine.id = "guide_" + Util.getUniqueID();
        this.guideLine.className = "rulerGuideLine " + ((this.side === "top") ? "verticalGuideLine" : "horizontalGuideLine");
        this.guideLine.style[this.direction] = this.guidePosition;
        global[this.side + "Guides"][(this.positionVal - 2) + "px"] = this;
        global[this.side + "Guides"][(this.positionVal - 1) + "px"] = this;
        global[this.side + "Guides"][this.positionVal + "px"] = this;
        global[this.side + "Guides"][(this.positionVal + 1) + "px"] = this;
        global[this.side + "Guides"][(this.positionVal + 2) + "px"] = this;
        ruler.appendChild(this.guideLine);
    };

    /**
      Destroy the Guide
    */
    Guide.prototype.destroy = function() {
        this.guideLine.parentNode.removeChild(this.guideLine);
        delete global[this.side + "Guides"][(this.positionVal - 2) + "px"];
        delete global[this.side + "Guides"][(this.positionVal - 1) + "px"];
        delete global[this.side + "Guides"][this.positionVal + "px"];
        delete global[this.side + "Guides"][(this.positionVal + 1) + "px"];
        delete global[this.side + "Guides"][(this.positionVal + 2) + "px"];
    };

    /**
      Constructor for creating rulers.
    */
    w.RulerBars = function() {
        if (!(this instanceof RulerBars)) {
            throw new Error("RulerBars is a constructor, use the \"new\" operator to create new instance.");
        }
        global.HORIZONTAL_TEMPORARY_GUIDE = document.createElement("div");
        global.HORIZONTAL_TEMPORARY_GUIDE.className = "tempGuideHorizontal tempGuide invisible";
        global.VERTICAL_TEMPORARY_GUIDE = document.createElement("div");
        global.VERTICAL_TEMPORARY_GUIDE.className = "tempGuideVertical tempGuide invisible";
        registerDefaultCSS();
        registerFunctionsWithContext(this);
        document.addEventListener("mouseout", function(e) {
            var from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName === "HTML") {
                if (global.activeGuide) {
                    global.activeGuide.destroy();
                    global.activeGuide = null;
                }
            }
        }, false);
    };

    /**
      Register default CSS
    */
    var registerDefaultCSS = function() {
        var cssDefinition = "";
        cssDefinition += ".invisible{visibility:hidden;}";
        Util.applyCSSRule(cssDefinition, "ruler_default_css");
    };

    /**
      Bind the functions with the RulerBars context.
      @ctx: The RulerBars context
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
      Create a Ruler.
      @config: object
      @config.size: The desired length of the ruler in pixels, default is 100.
      @config.unitSize: The size of each unit in the ruler, default is 10.
      @config.side: "top" or "left", default is "top".
      @config.startPoint: The startPoint for the ruler, default is 0.
      @config.foregroundColor: The color of units on the ruler, default #000 (black).
      @config.backgroundColor: The background color of the ruler, default #fff (white).
      @config.tempGuideColor: The color of temporary guide line, default #ffaaab (Cornflower Lilac).
      @config.guideColor: The color of guide line, default #ff0400 (Red).
    */
    var getRuler = function(config) {
        var _this = this;
        if (typeof config !== "object") {
            throw new Error("Invalid config param, expected object.");
        }
        config = config || {};
        config.backgroundColor = config.backgroundColor || "#fff";
        config.foregroundColor = config.foregroundColor || "#000";
        config.side = (config.side === "left") ? config.side : "top";
        config.size = parseInt(config.size, 10) || 100;
        config.tempGuideColor = config.tempGuideColor || "#ffaaab";
        config.guideColor = config.guideColor || "#ff0400";
        if (isNaN(config.size) || config.size < 0) {
            throw new Error("Invalid size parameter specified " + config.size + ". Expected positive number.");
        }
        config.unitSize = parseInt(config.unitSize, 10) || 10;
        if (isNaN(config.unitSize) || config.unitSize < 0) {
            throw new Error("Invalid unitSize parameter specified " + config.unitSize + ". Expected positive number.");
        }
        config.startPoint = parseInt(config.startPoint, 10) || 0;
        if (isNaN(config.startPoint)) {
            throw new Error("Invalid startPoint specified, expected number.");
        }
        if (config.startPoint % 10 !== 0) {
            var diff = 10 - (Math.abs(config.startPoint) % 10);
            if (config.startPoint < 0) {
                config.startPoint -= diff;
            } else {
                config.startPoint -= 10 - diff;
            }
        }
        var rulerThickness = global.RULER_THICKNESS;
        var ruler = document.createElement("div");
        ruler.className = "rulerBar ruler " + config.side;
        var rulerBG = document.createElement("div");
        rulerBG.className = "rulerBG";
        rulerBG.style.backgroundColor = config.backgroundColor;
        ruler.appendChild(rulerBG);
        var big = document.createElement("div");
        big.className = "big";
        var medium = document.createElement("div");
        medium.className = "medium";
        var small = document.createElement("div");
        small.className = "small";
        var units = [big, medium, small];
        var iterations = Math.ceil(config.size / 10);
        for (var i = (config.startPoint / 10), ctr = 0; i <= iterations; i++) {
            var unit;
            if (Math.abs(i) % 10 === 0) {
                unit = big.cloneNode(true);
                if (true || Math.abs(i) > 0) {
                    unit.setAttribute("unit-value", (i * 10));
                }
            } else if (Math.abs(i) % 2 === 1) {
                unit = small.cloneNode(true);
            } else if (Math.abs(i) % 2 === 0) {
                unit = medium.cloneNode(true);
            }
            unit.style[config.side === "top" ? "left" : "top"] = (ctr * config.unitSize) + "px";
            ruler.appendChild(unit);
            ctr++;
        }
        ruler.style[config.side === "top" ? "width" : "height"] = ((ctr * config.unitSize) - config.unitSize) + "px";
        rulerBG.style[config.side === "top" ? "width" : "height"] = ((ctr * config.unitSize) - config.unitSize + rulerThickness) + "px";
        rulerBG.style[config.side === "top" ? "height" : "width"] = rulerThickness + "px";
        rulerBG.style[config.side === "top" ? "top" : "left"] = (-1 * rulerThickness) + "px";
        rulerBG.style[config.side === "top" ? "left" : "top"] = (-1 * rulerThickness) + "px";

        var colorDefinitionTop = ".ruler.top, .ruler.top .big, .ruler.top .medium, .ruler.top .small{border-color: {{fgColor}};color: {{fgColor}};}";
        var colorDefinitionLeft = ".ruler.left, .ruler.left .big, .ruler.left .medium, .ruler.left .small  {border-color: {{fgColor}};color: {{fgColor}};}";
        var colorDefinition = (config.side === "top") ? colorDefinitionTop : colorDefinitionLeft;
        colorDefinition = colorDefinition.split("{{fgColor}}").join(config.foregroundColor);
        Util.applyCSSRule(colorDefinition, "rulerCSS_" + config.side);

        var guideDefinition;
        if (config.side === "left") {
            guideDefinition = ".tempGuideHorizontal{border:none;transform:scaleY(2.0);border-top:1px solid " + config.tempGuideColor + ";pointer-events:none;position:absolute;left:-" + global.RULER_THICKNESS + "px;top:0;width:" + (this.TOP_RULER_SIZE + global.RULER_THICKNESS) + "px;}";
            guideDefinition += "\n.horizontalGuideLine{border:none;transform:scaleY(2.0);border-top:1px solid " + config.guideColor + ";pointer-events:none;position:absolute;left:-" + global.RULER_THICKNESS + "px;top:0;width:" + (this.TOP_RULER_SIZE + global.RULER_THICKNESS) + "px;}";
        } else {
            guideDefinition = ".tempGuideVertical{border:none;transform:scaleX(2.0);border-left:1px solid " + config.tempGuideColor + ";pointer-events:none;position:absolute;left:0;top:-" + global.RULER_THICKNESS + "px;height:" + (this.LEFT_RULER_SIZE + global.RULER_THICKNESS) + "px;}";
            guideDefinition += "\n.verticalGuideLine{border:none;transform:scaleX(2.0);border-left:1px solid " + config.guideColor + ";pointer-events:none;position:absolute;left:0;top:-" + global.RULER_THICKNESS + "px;height:" + (this.LEFT_RULER_SIZE + global.RULER_THICKNESS) + "px;}";
        }
        Util.applyCSSRule(guideDefinition, "guideDefinition_" + config.side);

        ruler.appendChild((config.side === "top") ? global.VERTICAL_TEMPORARY_GUIDE : global.HORIZONTAL_TEMPORARY_GUIDE);

        ruler.addEventListener("mousedown", function(e) {
            rulerMouseDown(e, ruler, config);
        }, false);
        ruler.addEventListener("mousemove", function(e) {
            rulerMouseMove(e, ruler, config);
        }, false);
        ruler.addEventListener("mouseup", function(e) {
            rulerMouseUp(e, ruler, config);
        }, false);
        ruler.addEventListener("mouseover", function(e) {
            rulerMouseOver(e, ruler, config);
        }, false);
        ruler.addEventListener("mouseout", function(e) {
            rulerMouseOut(e, ruler, config);
        }, false);
        ruler.addEventListener("click", function(e) {
            rulerClick(e, ruler, config);
        }, false);

        return ruler;
    };

    var adjustGuidePosition = function(e, ruler, config, rulerHovered) {
        var offsetProp = (config.side === "top") ? "offsetX" : "offsetY";
        var direction = (config.side === "top") ? "left" : "top";
        var tmpGuide = (config.side === "top") ? global.VERTICAL_TEMPORARY_GUIDE : global.HORIZONTAL_TEMPORARY_GUIDE;
        var offset = (rulerHovered) ? global.RULER_THICKNESS : 0;
        var guidePosition = Math.ceil(e[offsetProp] - offset);
        tmpGuide.classList.add("invisible");
        if (global.activeGuide) {
            global.activeGuide.guideLine.style[direction] = guidePosition + "px";
            if (guidePosition < 0) {
                global.activeGuide.guideLine.classList.add("invisible");
                ruler.classList.remove("guideEnabled");
            } else {
                global.activeGuide.guideLine.classList.remove("invisible");
                ruler.classList.add("guideEnabled");
            }
        }
    };

    var rulerMouseDown = function(e, ruler, config) {
        this.rulerParent.classList.add("noselect");
        if (!this.guides) {
            return;
        }
        var offsetProp = (config.side === "top") ? "offsetX" : "offsetY";
        var guidePosition = Math.ceil(e[offsetProp] - global.RULER_THICKNESS) + "px";
        if (global[config.side + "Guides"][guidePosition]) {
            global.activeGuide = global[config.side + "Guides"][guidePosition];
        }
    };

    var rulerMouseMove = function(e, ruler, config) {
        if (!this.guides) {
            return;
        }
        var tmpGuide = (config.side === "top") ? global.VERTICAL_TEMPORARY_GUIDE : global.HORIZONTAL_TEMPORARY_GUIDE;
        if (global.activeGuide) {
            adjustGuidePosition(e, ruler, config, true);
        } else {
            tmpGuide.classList.remove("invisible");
            showTemporaryGuide(e, config.side);
        }
    };

    var rulerMouseUp = function(e, ruler, config) {
        this.rulerParent.classList.remove("noselect");
        if (!this.guides) {
            return;
        }
        if (global.activeGuide) {
            global.activeGuide.destroy();
            global.activeGuide = null;
            if ((config.side === "top" && Math.ceil(e.offsetX) < global.RULER_THICKNESS) || (config.side === "left" && Math.ceil(e.offsetY) < global.RULER_THICKNESS)) {
                return;
            }
            new Guide(e,config,ruler);
        }
    };

    var rulerMouseOver = function(e, ruler, config) {
        if (global.activeGuide && !ruler.querySelector("#" + global.activeGuide.guideLine.id)) {
            global.activeGuide.destroy();
            global.activeGuide = null;
        }
    };

    var rulerMouseOut = function(e, ruler, config) {
        this.rulerParent.classList.remove("noselect");
        if (global.activeGuide) {
            adjustGuidePosition(e, ruler, config, false);
        }
        var tmpGuide = (config.side === "top") ? global.VERTICAL_TEMPORARY_GUIDE : global.HORIZONTAL_TEMPORARY_GUIDE;
        tmpGuide.classList.add("invisible");
    };

    var rulerClick = function(e, ruler, config) {
        if (!this.guides) {
            return;
        }
        if ((config.side === "top" && Math.ceil(e.offsetX) < global.RULER_THICKNESS) || (config.side === "left" && Math.ceil(e.offsetY) < global.RULER_THICKNESS)) {
            return;
        }
        new Guide(e,config,ruler);
    };

    /**
      Remove the rulers from DOM
    */
    RulerBars.prototype.removeRulers = function() {
        this.rulerParent.classList.remove("noselect");
        var rulers = document.querySelectorAll(".ruler");
        [].forEach.call(rulers, function(ruler) {
            ruler.parentNode.removeChild(ruler);
        });
        this.rulerBarsEnabled = false;
    };

    /**
      Show the hidden rulers by removing css class "invisible".
    */
    RulerBars.prototype.showRulers = function() {
        var rulers = document.querySelectorAll(".ruler");
        [].forEach.call(rulers, function(ruler) {
            ruler.classList.remove("invisible");
        });
    };

    /**
      Hide the rulers by adding css class "invisible"
    */
    RulerBars.prototype.hideRulers = function() {
        var rulers = document.querySelectorAll(".ruler");
        [].forEach.call(rulers, function(ruler) {
            ruler.classList.add("invisible");
        });
    };

    /**
      Enable the guides functionality for rulers.
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
      Disable the guides functionality for rulers.
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
        var tmpGuide = (side === "top") ? global.VERTICAL_TEMPORARY_GUIDE : global.HORIZONTAL_TEMPORARY_GUIDE;
        var currentRuler = (side === "top") ? this.topRuler : this.leftRuler;
        var direction = (side === "top") ? "left" : "top";
        var offsetProp = (side === "top") ? "offsetX" : "offsetY";
        tmpGuide.classList.remove("invisible");

        tmpGuide.style[direction] = Math.ceil(evt[offsetProp] - global.RULER_THICKNESS) + "px";
        if (Math.ceil(evt[offsetProp] - global.RULER_THICKNESS) < 0) {
            tmpGuide.classList.add("invisible");
        }
        if (Math.ceil(evt[offsetProp]) < global.RULER_THICKNESS) {
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
        var horizontalGuideLineSize = (this.TOP_RULER_SIZE * scale) + global.RULER_THICKNESS;
        var verticalGuideLineSize = (this.LEFT_RULER_SIZE * scale) + global.RULER_THICKNESS;

        var rulerZoomConfig = "";
        rulerZoomConfig += ".verticalGuideLine{transform-origin:0 0;height:" + verticalGuideLineSize + "px;transform:scale(" + guideLineThicknessScale + ",1);}";
        rulerZoomConfig += "\n.tempGuideVertical{transform-origin:0 0;height:" + verticalGuideLineSize + "px;transform:scale(" + guideLineThicknessScale + ",1);}";
        rulerZoomConfig += "\n.horizontalGuideLine{transform-origin:0 0;width:" + horizontalGuideLineSize + "px;transform:scale(1," + guideLineThicknessScale + ");}";
        rulerZoomConfig += "\n.tempGuideHorizontal{transform-origin:0 0;width:" + horizontalGuideLineSize + "px;transform:scale(1," + guideLineThicknessScale + ");}";
        rulerZoomConfig += "\n.ruler.top .big:before{transform-origin:0 0;transform:scaleX(" + (1 / scale) + ");}";
        rulerZoomConfig += "\n.ruler.left .big:before{transform-origin:0 0;transform:rotate(-90deg) scaleX(" + (1 / scale) + ");}";
        Util.applyCSSRule(rulerZoomConfig, "rulerZoomConfig");

        this.topRuler.style.transformOrigin = "0 0";
        this.topRuler.style.transform = "scaleX(" + scale + ")";
        this.leftRuler.style.transformOrigin = "0 0";
        this.leftRuler.style.transform = "scaleY(" + scale + ")";
    };

    /**
      Create the top & left rulers by supplying a configuration object.
      @cfg: configuration for creating the rulers.
      @cfg.top: Configuration for Top Ruler See config param for getRuler()
      @cfg.left: Configuration for Left Ruler See config param for getRuler()
      @cfg.parent: The parent container where the Rulers need to be appended.
    */
    RulerBars.prototype.createRulers = function(cfg) {
        if (!cfg || !cfg.top || !cfg.left) {
            return;
        }
        var copiedCfg = Util.copyConfig(cfg);
        copiedCfg.parent = copiedCfg.parent || document.querySelector("body");

        this.TOP_RULER_SIZE = copiedCfg.top.size;
        this.LEFT_RULER_SIZE = copiedCfg.left.size;

        copiedCfg.top.side = "top";
        copiedCfg.left.side = "left";

        this.topRuler = getRuler(copiedCfg.top);
        this.leftRuler = getRuler(copiedCfg.left);

        this.rulerParent = copiedCfg.parent;

        copiedCfg.parent.appendChild(this.topRuler);
        copiedCfg.parent.appendChild(this.leftRuler);
        this.rulerBarsEnabled = true;
    };

})(window);