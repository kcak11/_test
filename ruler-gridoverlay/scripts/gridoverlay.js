/**
 * Copyright(c) - 2019 Ashish's Web
 * 
 * Author: K.C.Ashish Kumar
 * 
 * https://kcak11.com (or) https://ashishkumarkc.com
 * 
 * Repository: https://github.com/kcak11/pens
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

		/**
		 * Render the grid.
		 */
		this.renderGridOverlay = function() {
			if (isNaN(this.gridScale)) {
				this.gridScale = 1;
			}
			this.gridColor = this.gridColor || "#000";
			var _gbc = document.querySelector("#gridBarContainer");
			_gbc && _gbc.parentNode.removeChild(_gbc);
			gridSize = Math.max(10, (this.gridScale * 10));
			var width = element.offsetWidth;
			var height = element.offsetHeight;
			var gridBarContainer = document.createElement("div");
			gridBarContainer.id = "gridBarContainer";
			gridBarContainer.style.position = "absolute";
			gridBarContainer.style.top = 0;
			gridBarContainer.style.right = 0;
			gridBarContainer.style.bottom = 0;
			gridBarContainer.style.left = 0;
			gridBarContainer.style.pointerEvents = "none";
			gridBarContainer.style.boxSizing = "border-box";
			for (var w = 0; w < width; w += gridSize) {
				var vBar = document.createElement("div");
				vBar.className = "vGridBar";
				vBar.style.borderRight = "1px dotted " + this.gridColor;
				vBar.style.position = "absolute";
				vBar.style.left = w + "px";
				vBar.style.top = 0;
				vBar.style.height = height + "px";
				vBar.style.pointerEvents = "none";
				vBar.style.boxSizing = "border-box";
				vBar.style.transformOrigin = "0 0";
				vBar.style.transform = "scaleX(" + (1 / this.gridScale) + ")";
				gridBarContainer.appendChild(vBar);
			}
			for (var h = 0; h < height; h += gridSize) {
				var hBar = document.createElement("div");
				hBar.className = "hGridBar";
				hBar.style.borderBottom = "1px dotted " + this.gridColor;
				hBar.style.position = "absolute";
				hBar.style.top = h + "px";
				hBar.style.left = 0;
				hBar.style.width = width + "px";
				hBar.style.pointerEvents = "none";
				hBar.style.boxSizing = "border-box";
				hBar.style.transformOrigin = "0 0";
				hBar.style.transform = "scaleY(" + (1 / this.gridScale) + ")";
				gridBarContainer.appendChild(hBar);
			}
			gridBarContainer.style.transformOrigin = "0 0";
			gridBarContainer.style.transform = "scale(" + this.gridScale + ")";
			container.appendChild(gridBarContainer);
			this.gridActive = true;
		};

		/**
		 * Zoom the Grid to the specified scale.
		 */
		this.zoom = function(scale) {
			if (!this.gridActive) {
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
			this.gridActive = false;
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