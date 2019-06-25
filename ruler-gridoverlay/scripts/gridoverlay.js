/**
 * Copyright(c) - 2019 Ashish's Web
 * 
 * Author: K.C.Ashish Kumar https://kcak11.com (or) https://ashishkumarkc.com
 * 
 * Repository: https://github.com/kcak11/pens 
 * LICENSE: MIT - https://mit-license.kcak11.com
 */

(function(w) {
	/**
	 * GridOverlay constructor
	 * 
	 * @container: The container element into which the grid should be appended.
	 * @element: The element on which the gridlines should be drawn.
	 */
	w.GridOverlay = function(container, element) {
		var _this = this;
		if (!(_this instanceof w.GridOverlay)) {
			throw new Error("GridOverlay needs to be invoked as a constructor.");
		}
		if (!container || !element) {
			throw new Error("Required parameters: container, element");
		}

		var gridZIndex = 0;
		var gridColor = "#000";
		var gridActive = false;

		/**
		 * Set the z-index for the Gridoverlay.
		 */
		this.setZIndex = function(zIndex) {
			if (!zIndex || isNaN(zIndex)) {
				zIndex = 0;
			}
			gridZIndex = zIndex;
			this.zoom(this.gridScale);
		};

		/**
		 * Set the color of the Gridoverlay.
		 */
		this.setColor = function(color) {
			if (!color) {
				color = "#000";
			}
			gridColor = color;
			this.zoom(this.gridScale);
		}

		/**
		 * Check whether the Gridoverlay is displayed or not.
		 */
		this.isGridActive = function() {
			return !!gridActive;
		};

		/**
		 * Render the grid.
		 */
		this.renderGridOverlay = function() {
			if (!this.gridScale || isNaN(this.gridScale)) {
				this.gridScale = 1;
			}
			var _gbc = document.querySelector("#gridBarContainer");
			_gbc && _gbc.parentNode.removeChild(_gbc);

			gridSize = Math.max(10, (this.gridScale * 10));
			if (container === element) {
				/* Use an alternative zooming approach when container and element are the same */
				gridSize = Math.max(2, (this.gridScale * 10));
			}
			var width = element.offsetWidth;
			var height = element.offsetHeight;
			var elementStyles = getComputedStyle(element, null);
			var left = parseFloat(elementStyles["left"]);
			var top = parseFloat(elementStyles["top"]);
			if (container === element) {
				/* When container and element are same, then position the grid at the top left corner i.e. left,top ==> 0,0 */
				left = top = 0;
			}
			left = (left && !isNaN(left)) ? left : 0;
			top = (top && !isNaN(top)) ? top : 0;
			var gridBarContainer = document.createElement("div");
			gridBarContainer.id = "gridBarContainer";
			gridBarContainer.style.position = "absolute";
			gridBarContainer.style.top = top + "px";
			gridBarContainer.style.right = 0;
			gridBarContainer.style.bottom = 0;
			gridBarContainer.style.left = left + "px";
			gridBarContainer.style.pointerEvents = "none";
			gridBarContainer.style.boxSizing = "border-box";
			gridBarContainer.style.zIndex = gridZIndex;
			for (var w = 0; w < width; w += gridSize) {
				var vBar = document.createElement("div");
				vBar.className = "vGridBar";
				vBar.style.borderRight = "1px dotted " + gridColor;
				vBar.style.position = "absolute";
				vBar.style.left = w + "px";
				vBar.style.top = 0;
				vBar.style.height = height + "px";
				vBar.style.pointerEvents = "none";
				vBar.style.boxSizing = "border-box";
				if (container !== element) {
					/* Avoid transformation scaling when container & element are the same */
					vBar.style.transformOrigin = "0 0";
					vBar.style.transform = "scaleX(" + (1 / this.gridScale) + ")";
				}
				gridBarContainer.appendChild(vBar);
			}
			for (var h = 0; h < height; h += gridSize) {
				var hBar = document.createElement("div");
				hBar.className = "hGridBar";
				hBar.style.borderBottom = "1px dotted " + gridColor;
				hBar.style.position = "absolute";
				hBar.style.top = h + "px";
				hBar.style.left = 0;
				hBar.style.width = width + "px";
				hBar.style.pointerEvents = "none";
				hBar.style.boxSizing = "border-box";
				if (container !== element) {
					/* Avoid transformation scaling when container & element are the same */
					hBar.style.transformOrigin = "0 0";
					hBar.style.transform = "scaleY(" + (1 / this.gridScale) + ")";
				}
				gridBarContainer.appendChild(hBar);
			}
			if (container !== element) {
				/* Avoid transformation scaling when container & element are the same */
				gridBarContainer.style.transformOrigin = "0 0";
				gridBarContainer.style.transform = "scale(" + this.gridScale + ")";
			}
			container.appendChild(gridBarContainer);
			gridActive = true;
		};

		/**
		 * Zoom the Grid to the specified scale.
		 */
		this.zoom = function(scale) {
			if (!this.isGridActive()) {
				return;
			}
			this.gridScale = scale || 1;
			checkContentLoaded();
		};

		/**
		 * Remove the Grid from the DOM.
		 */
		this.removeGridOverlay = function() {
			var gridBarContainer = document.querySelector("#gridBarContainer");
			gridBarContainer && gridBarContainer.parentNode.removeChild(gridBarContainer);
			gridActive = false;
		};

		var checkContentLoaded = function() {
			if (element && element.tagName.toLowerCase() !== "img") {
				_this.renderGridOverlay(_this.gridSizeVal);
			} else {
				if (element.complete) {
					_this.renderGridOverlay(_this.gridSizeVal);
				} else {
					setTimeout(function() {
						_this.checkContentLoaded();
					}, 100);
				}
			}
		};

		/**
		 * Create the Grid Overlay.
		 */
		this.createGridOverlay = function(scale) {
			this.gridScale = scale || 1;
			checkContentLoaded();
		};
	};
})(window);
