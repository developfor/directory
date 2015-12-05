module.exports = function(app) {

	var deleteFile = function(filename){

		var rmdir = require( 'rmdir' );
		if (filename !== null){

			var path = 'public/uploads/img/' + filename
			console.log(path)
			rmdir( path, function ( err, dirs, files ){
			  console.log( dirs );
			  console.log( files );
			  console.log( 'all files are removed' );
			});
		
		}
			
	}
	
}