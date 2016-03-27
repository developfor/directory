var thumbnailGenerator = function(t) {
	// var text = text;
	// console.log(">>>" +t)

	var bigTextThumb = function(){
		var Canvas = require('canvas')
		      , Image = Canvas.Image
		      , canvas = new Canvas(600,600)
		      , ctx = canvas.getContext('2d');

		ctx.font = '400px Helvetica';

		ctx.fillStyle = "#000";
		ctx.textAlign = 'center';
		ctx.fillText(t, 350, 400);
		console.log("bigTextThumb")

		return canvas.toDataURL();
	}

	var smallTextThumb = function(){
		var Canvas = require('canvas')
	      , Image = Canvas.Image
	      , canvas = new Canvas(200,200)
	      , ctx = canvas.getContext('2d');

	    ctx.font = '150px Helvetica';

	    ctx.fillStyle = "#000";
	    ctx.textAlign = 'center';
	    ctx.fillText(t, 100, 140);
		console.log("smallTextThumb")

		return  canvas.toDataURL();
	}

	return{
		bigTextThumb: bigTextThumb,
		smallTextThumb: smallTextThumb
	}

}

module.exports = thumbnailGenerator;