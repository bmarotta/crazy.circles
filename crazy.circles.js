/**
 *
 * @source: http://www.kopf.com.br/crazy.circles.js
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2015  Bruno Marotta
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

 // Date now prototype
if (!Date.now) {
	Date.now = function () { return new Date().getTime(); };
}

// animation prototype
var requestAnimFrame =
			   window.requestAnimationFrame ||
			   window.webkitRequestAnimationFrame   ||
			   window.mozRequestAnimationFrame      ||
			   window.oRequestAnimationFrame        ||
			   window.msRequestAnimationFrame       ||
			   function (callback) {
            setTimeout(callback, 16);
        };

// Class declaration
var CrazyCircles = function (holderId, options) {
	this.holderId = holderId;
	this.options = options;
	this.paper = null;

	this.defaultOptions = {
		// These are the defaults.
		color: "multi",
		backgroundColor: "white",
		shadow: true,
		size: 60,
		totalCircles: 8,
		cycleDuration: 2000,
		circleSize: 0, // Calculate automatically
		goCrazyCycle: 0, // Never go crazy
		fadeIn: false,
		image: "",
		imageWidth: 0,
		imageHeight: 0
	};

	this.initialize();
}

CrazyCircles.prototype.resetOptions = function(options) {
	this.options = options;
	this.initialize();
 }

 CrazyCircles.prototype.initialize = function() {

	this.cleanOptions();

	// Clear paper if already existing
	if (this.paper != null) {
		var paperDom = this.paper.canvas;
		paperDom.parentNode.removeChild(paperDom);
	}

	this.paper = Raphael(this.holderId, this.options.size, this.options.size);
	try	{
		this.paper.canvas.style.backgroundColor = this.options.backgroundColor;
	}
	catch (ex) {
	  // just ignore it
	}
	Raphael.getColor.reset();

	this.radius = this.options.size / 2 - this.options.circleSize - 1;

	this.circleInfos = new Object();
	this.start = null;
	for (var i = 0; i < this.options.totalCircles; i++) {
		this.circleInfos[i] = this.initializeCircle(i);
	}

	// Save this to local variable to be accessible on the animationStep function
	var current = this;
	//var xxx = 0;
	this.lastFrame = 0;

	function animationStep(timestamp) {

		if (timestamp == null)
		  timestamp = Date.now();
		
		//timestamp = xxx;
		//xxx = xxx + 60;
		
		if (!current.start) {
			current.start = timestamp;
			current.lastFrame = timestamp;
		}
	
		var progress = (timestamp - current.start);
		var delta = (timestamp - current.lastFrame);
		current.lastFrame = timestamp;

		for (var i = 0; i < current.options.totalCircles; i++)
		{
			current.animateCircle(current.circleInfos[i], progress, delta);
		}
	
		var currentCycle = progress / current.options.cycleDuration;
	
		// Check if we have to restart
		if (current.options.restartAfterCycle > 0 &&
		    (currentCycle >= current.options.restartAfterCycle))
		{
			current.initialize();
			return;
		}
	
		// Check if ball 0 is still stuck and we can go crazy
		if (!current.circleInfos[0].free && current.options.goCrazyCycle > 0 &&
		    (currentCycle >= current.options.goCrazyCycle))
		{
			current.setFree(current.circleInfos[0], progress);
		}
	
		// If balls are free. Check the collisions
		if (current.circleInfos[0].free)
			for (var i = 0; i < current.options.totalCircles; i++)
				for (var j = i + 1; j < current.options.totalCircles; j++)
				{
					current.calculateCollisions(current.circleInfos[i], current.circleInfos[j], progress, delta);
				}
	
		requestAnimFrame(animationStep);
	
	};

	requestAnimFrame(animationStep);
};


CrazyCircles.prototype.cleanOptions = function() {

	if (this.options == null)
	  this.options = this.defaultOptions;

	if (this.options.size == null || this.options.size == 0)
	{
		this.options.size = Math.min(document.getElementById(this.holderId).clientWidth,
									 document.getElementById(this.holderId).clientHeight);
	}
	if (this.options.size < 20 || isNaN(this.options.size))
		this.options.size = 20;

	
	if (this.options.totalCircles == null || this.options.totalCircles < 1)
		this.options.totalCircles = this.defaultOptions.totalCircles;
	
	if (this.options.cycleDuration == null)
	    this.options.cycleDuration = this.defaultOptions.cycleDuration;
	if (this.options.cycleDuration < 500)
		this.options.cycleDuration = 500;
	
	this.hasImage = false;
	this.offSetX = 0;
	this.offSetY = 0;
	if (this.options.image != "")
	{
		if (this.options.imageWidth > 0 && this.options.imageHeight > 0) {
			// Calculate circle size
			this.hasImage = true;
			this.offSetX = -(this.options.imageWidth / 2);
			this.offSetY = -(this.options.imageHeight / 2);
			this.options.circleSize = Math.max(this.options.imageWidth,this.options.imageHeight) / 2 + 1;
		}
	}
		
	
	if (this.options.circleSize == null || this.options.circleSize == 0 || this.options.circleSize == "auto") {
		this.options.circleSize = this.options.size / 20;
	}
	if (this.options.circleSize < 1)
		this.options.circleSize = 1;

	if (this.options.goCrazyCycle != null && this.options.goCrazyCycle > 0)
	{
		if (this.options.fadeIn && this.options.goCrazyCycle <= this.options.totalCircles) {
			this.options.goCrazyCycle = Number(this.options.totalCircles) + Number(this.options.goCrazyCycle);
		}
	}

	if (this.options.restartAfterCycle != null && this.options.restartAfterCycle > 0)
	{
		if (this.options.fadeIn && this.options.restartAfterCycle <= this.options.totalCircles) {
			this.options.restartAfterCycle = Number(this.options.totalCircles) + Number(this.options.restartAfterCycle);
		}
	}
};

CrazyCircles.prototype.initializeCircle = function(circleNum) {
			
	var color = this.options.color == "multi" ? Raphael.getColor() : this.options.color;

	if (color == undefined)
	  color = "#a0a0a0";
	
	var circleInfo = {
		num: circleNum,
		angle: (180 / this.options.totalCircles * circleNum) / 180 * Math.PI,
		pathOffSet: (50 / this.options.totalCircles * circleNum),
		free: false
	};

	if (this.options.shadow && !this.hasImage) {
		circleInfo.circleShadow = this.paper.circle(0, 0, this.options.circleSize).attr("fill", color).attr("stroke", color).attr("opacity",.3);
	}

	circleInfo.circle = this.hasImage ?
		this.paper.image(this.options.image, 0, 0, this.options.imageWidth, this.options.imageHeight) :
		this.paper.circle(0, 0, this.options.circleSize).attr("fill", color).attr("stroke", color);

	this.setCirclePosition(circleInfo, 0);

	return circleInfo;
}

CrazyCircles.prototype.xattr = function() {
	return this.hasImage ? "x" : "cx";
}

CrazyCircles.prototype.yattr = function() {
	return this.hasImage ? "y" : "cy";
}

CrazyCircles.prototype.animateCircle = function(circleInfo, progressMs, deltaMs) {

	if (circleInfo.free) {

		if (circleInfo.circleShadow != null) {
			circleInfo.circleShadow.attr(this.xattr(), circleInfo.circle.attr(this.xattr()));
			circleInfo.circleShadow.attr(this.yattr(), circleInfo.circle.attr(this.yattr()));
		}

		var newPos = {
		  cx: Math.round(circleInfo.circle.attr(this.xattr()) + circleInfo.vx * deltaMs, 4),
		  cy: Math.round(circleInfo.circle.attr(this.yattr()) + circleInfo.vy * deltaMs, 4)
		};
	
		this.checkBoundaries(newPos, circleInfo);
	
		circleInfo.circle.attr(this.xattr(), Math.round(newPos.cx, 4));
		circleInfo.circle.attr(this.yattr(), Math.round(newPos.cy, 4));
			
	} else {
		this.setCirclePosition(circleInfo, progressMs, deltaMs);
	}
}

CrazyCircles.prototype.setCirclePosition = function(circleInfo, progressMs, deltaMs) {
	var currentCycle = progressMs / this.options.cycleDuration;

	if (circleInfo.circleShadow != null) {
		var pathPosShadow = this.adjustPathPos(progressMs - 40, circleInfo.pathOffSet);
		circleInfo.circleShadow.attr(this.xattr(), (this.options.size / 2) + this.radius * pathPosShadow * Math.cos(circleInfo.angle));
		circleInfo.circleShadow.attr(this.yattr(), (this.options.size / 2) + this.radius * pathPosShadow * Math.sin(circleInfo.angle));

		if (this.options.fadeIn) {
		  if (currentCycle < circleInfo.num) {
			circleInfo.circleShadow.attr("opacity", 0);
		  } else if (currentCycle < circleInfo.num + 1) {
			circleInfo.circleShadow.attr("opacity", 0.3 * (progressMs % this.options.cycleDuration) / this.options.cycleDuration);
		  } else {
			circleInfo.circleShadow.attr("opacity", 0.3);
		  }
		}
	}

	var pathPosAdjusted = this.adjustPathPos(progressMs, circleInfo.pathOffSet);
	var oldPos = { x: circleInfo.circle.attr(this.xattr()), y: circleInfo.circle.attr(this.yattr()) };

	circleInfo.circle.attr(this.xattr(), (this.options.size / 2) + this.radius * pathPosAdjusted * Math.cos(circleInfo.angle) + this.offSetX);
	circleInfo.circle.attr(this.yattr(), (this.options.size / 2) + this.radius * pathPosAdjusted * Math.sin(circleInfo.angle) + this.offSetY);

	if (this.options.fadeIn) {
	  if (currentCycle < circleInfo.num) {
		circleInfo.circle.attr("opacity", 0);
	  } else if (currentCycle < circleInfo.num + 1) {
		circleInfo.circle.attr("opacity", (progressMs % this.options.cycleDuration) / this.options.cycleDuration);
	  } else {
		circleInfo.circle.attr("opacity", 1);
	  }
	}

	// Calculate the current velocity for circles for the collision when we set them free
	if (circleInfo.num > 0) {
		circleInfo.vx = (circleInfo.circle.attr(this.xattr()) - oldPos.x) / deltaMs;
		circleInfo.vy = (circleInfo.circle.attr(this.yattr()) - oldPos.y) / deltaMs;
	}
}

CrazyCircles.prototype.adjustPathPos = function(progressMs, pathOffSet) {
	var pathPos = progressMs / this.options.cycleDuration * 100 + pathOffSet;

	pathPos = (pathPos % 100) / 50;
	if (pathPos > 1)
	  pathPos = 2 - pathPos;
	pathPos = pathPos * 2 - 1;

	var negative = pathPos < 0;

	// ease out sine
	pathPos = Math.sin(Math.abs(pathPos) * (Math.PI/2));
	if (negative)
	  pathPos = -pathPos;
	
	return pathPos;
}

CrazyCircles.prototype.setFree = function(circleInfo, progressMs) {
	circleInfo.free = true;

	if (circleInfo.vx == null || isNaN(circleInfo.vx) || isNaN(circleInfo.vy) || Math.abs(circleInfo.vx) < 0.03 || Math.abs(circleInfo.vy) < 0.03)
	{
		circleInfo.vx = Math.cos(circleInfo.angle) * (this.radius * 4 / this.options.cycleDuration);
		circleInfo.vy = Math.sin(circleInfo.angle) * (this.radius * 4 / this.options.cycleDuration);
	
		var pathPos = progressMs / this.options.cycleDuration * 100 + circleInfo.pathOffSet;
		pathPos = (pathPos % 100) / 50;
		if (pathPos > 1) {
			// we are coming back
			circleInfo.vx = circleInfo.vx * -1;
			circleInfo.vy = circleInfo.vy * -1;
		}
	}


}

CrazyCircles.prototype.checkBoundaries = function(newPos, circleInfo) {
	if (newPos.cx < this.options.circleSize + this.offSetX || isNaN(newPos.cx)) {
		newPos.cx = this.options.circleSize + this.offSetX;
		circleInfo.vx = circleInfo.vx * -1;
	} else {
		if (newPos.cx > this.options.size - this.options.circleSize + this.offSetX) {
			newPos.cx = this.options.size - this.options.circleSize + this.offSetX;
			circleInfo.vx = circleInfo.vx * -1;
		}
	}
	if (newPos.cy < this.options.circleSize + this.offSetY || isNaN(newPos.cy)) {
		newPos.cy = this.options.circleSize + this.offSetY;
		circleInfo.vy = circleInfo.vy * -1;
	} else {
		if (newPos.cy > this.options.size - this.options.circleSize + this.offSetY) {
			newPos.cy = this.options.size - this.options.circleSize + this.offSetY;
			circleInfo.vy = circleInfo.vy * -1;
		}
	}
}

CrazyCircles.prototype.calculateCollisions = function(circleInfo1, circleInfo2, progress, delta) {

	var firstBall  = { x: circleInfo1.circle.attr(this.xattr()), y: circleInfo1.circle.attr(this.yattr()) };
	var secondBall = { x: circleInfo2.circle.attr(this.xattr()), y: circleInfo2.circle.attr(this.yattr()) };


	var distance = Math.sqrt(
            ((firstBall.x - secondBall.x) * (firstBall.x - secondBall.x))
          + ((firstBall.y - secondBall.y) * (firstBall.y - secondBall.y))
           );

	if (distance < this.options.circleSize * 2)
	{
		//balls have collided
		if (!circleInfo1.free) {
			this.setFree(circleInfo1, progress);
		}
	
		if (!circleInfo2.free) {
			this.setFree(circleInfo2, progress);
		}
	
		var newVx = circleInfo2.vx;
		var newVy = circleInfo2.vy;
		circleInfo2.vx = circleInfo1.vx;
		circleInfo2.vy = circleInfo1.vy;
		circleInfo1.vx = newVx;
		circleInfo1.vy = newVy;
	
		// Move balls apart
		this.animateCircle(circleInfo1, 0, delta);
	
		var tentatives = 0;
	
		// Move the second time as many times as needed for having them apart (avoid rounding error)
		// maximum three (avoid infinte loop)
		while (distance < this.options.circleSize * 2 && tentatives++ < 3) {
			this.animateCircle(circleInfo2, 0, delta);
		
			// Check again until they are really apart
		
			firstBall  = { x: circleInfo1.circle.attr(this.xattr()), y: circleInfo1.circle.attr(this.yattr()) };
			secondBall = { x: circleInfo2.circle.attr(this.xattr()), y: circleInfo2.circle.attr(this.yattr()) };
		
			distance = Math.sqrt(
				((firstBall.x - secondBall.x) * (firstBall.x - secondBall.x))
			  + ((firstBall.y - secondBall.y) * (firstBall.y - secondBall.y))
			   );
	
		}
	}

}
