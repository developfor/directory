"use strict";

module.exports = function(req, res, randomString, cb) {
	console.log("You are here!")
	var multer  = require('multer');

	var path = require('path'); 
	var fs = require('fs');
	var gm = require('gm').subClass({ imageMagick: true });
	var mkdirp = require('mkdirp');
	var rmdir = require( 'rmdir' );
	var redirectTo = "/"
	
	var imageFileName = randomString + ".jpg";

	var folderId = randomString;
	var imageFilePath = req.file.path


	gm(imageFilePath)
		.size(function (err, size) {
			
			if (err) {
				// if (false) {
				console.log("Not an image or file is too big!")
				fs.unlink(imageFilePath, function(){
					console.log("deleted " + req.file.filename);
				})
				
				return res.redirect(redirectTo); 
			}else{
				console.log(size)

			var folderName = "public/uploads/img/" + folderId
			mkdirp(folderName, function (err) {
			    if(err){
			    	console.error(err)
			    }else{ 
			    	console.log('pow!')
				}
			
				gm(imageFilePath)
					.resize(600,600)
					.gravity('Center')
					.extent(600,600)
					.background('#ffffff')
					.crop(600,600, 0, 0)
					.noProfile()
					.setFormat("jpg")
					.write(folderName + "/" + "thumb_" + imageFileName , function (err) {
						 if(err){console.error(err)
						 	console.log("not an image!")
							fs.unlink(imageFilePath, function(){
								console.log("deleted =====> " + req.files.filename);
							})

							var path = 'public/uploads/img/' + folderName
							console.log(path)
							rmdir( path, function ( err, dirs, files ){
							  console.log( dirs );
							  console.log( files );
							  console.log( 'all files are removed' );
							});


							return res.redirect(redirectTo); 
						 }


						var size = {width: 1000, height: 1000};
						gm(imageFilePath)
							.resize(1000,1000)
							.gravity('Center')
							.background('#ffffff')
							.out("-flatten")
							.crop(size.width, size.height, 0, 0)
							.gravity('Center')
							.noProfile()
							.setFormat("jpg")
							.write(folderName +"/" + "normal_" + imageFileName , function (err) {

								gm(imageFilePath)
									.background('#ffffff')
									.setFormat("jpg")
									.resize(200, 200)
									.gravity('Center')
									.extent(150,150)
									.crop(150,150, 0, 0)
									.write(folderName +"/" + "icon_" + imageFileName , function (err) { 

									// console.log("image made or something");
										
										fs.unlink(imageFilePath, function(){
											console.log("deleted" + req.file.filename);
											// console.log(funct);
											console.log("1 first call")
											cb();
											
										})

									})
							});
					});
			});
		}
	});

}