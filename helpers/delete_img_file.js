module.exports = function(foldername) {

	

		var rmdir = require( 'rmdir' );
		if (foldername !== null){

			var path = 'public/uploads/img/' + foldername
			// console.log(path)
			rmdir( path, function ( err, dirs, files ){
			  console.log( dirs );
			  console.log( files );
			  console.log( 'all files are removed' );
			});
		
		}
			
	
}