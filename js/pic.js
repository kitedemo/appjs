/*

image.js
=======

Use one function to generate your image on a canvas.

You can call it all with strings:

     pimage('img.jpg', 'canvasID');

Or with a jQuery/Zepto selection:

     Meme('img.jpg', $('#canvasID'));

********************************************************************************
*/

window.pic = function(image, canvas) {

	/*
	Deal with the canvas
	*/

	// If it's nothing, set it to a dummy value to trigger error
	if (!canvas)
		canvas = 0;

	// If it's a string, conver it
	if (canvas.toUpperCase)
		canvas = document.getElementById(canvas);

	// If it's jQuery or Zepto, convert it
	if (($) && (canvas instanceof $))
		canvas = canvas[0];

	// Throw error
	if (!(canvas instanceof HTMLCanvasElement))
		throw new Error('No canvas selected');

	// Get context
	var context = canvas.getContext('2d');

	/*
	Deal with the image
	*/

	// If there's no image, set it to a dummy value to trigger an error
	if (!image)
		image = 0;

	// Convert it from a string
	if (image.toUpperCase) {
		var src = image;
		image = new Image();
		image.src = src;
	}

	// Set the proper width and height of the canvas
	var setCanvasDimensions = function(w, h) {
		canvas.width = w;
		canvas.height = h;
	};
	setCanvasDimensions(image.width, image.height);	

	/*
	Do everything else after image loads
	*/

	image.onload = function() {

		// Set dimensions
		setCanvasDimensions(image.width, image.height);

		// Draw the image
		context.drawImage(image, 0, 0);


	};

};
