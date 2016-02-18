var multer  = require('multer');

module.exports = {
		upload: multer({ 
			dest: './public/tmp/',
			limits: {
				 // fieldNameSize: 100,
			      fileSize: 9242880,
			      // fileSize: 428,
			      // files: 1,
			      //  fields: 100
			},

		    fileFilter: function (req, file, cb) {
		 		console.log(req.body);
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

