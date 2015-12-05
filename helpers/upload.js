var multer  = require('multer');

module.exports = {
		upload: multer({ 
			dest: './public/tmp/',
			limits: {
				 // fieldNameSize: 100,
			      fileSize: 5242880,
			      // fileSize: 428,
			      files: 1,
			      // fields: 1
			},

		    fileFilter: function (req, file, cb) {
		 		console.log(req);
			    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
			      cb(null, false)

			    } else {
			      // console.log(file)
			      console.log(file.originalname + ' is starting ...');
			      cb(null, true)
			      console.log("what !!!!")
			    }

			 }

		})
		
}
