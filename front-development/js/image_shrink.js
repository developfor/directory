document.getElementById('file-input').onchange = function (e) {
	
	if(document.getElementById("the-image")){

		var removeImage = document.getElementById("the-image");
			removeImage.parentNode.removeChild(removeImage);
	}


    loadImage(
        e.target.files[0],
        function (img) {
          var image =   document.body.appendChild(img);
            image.setAttribute('id', 'the-image');
            console.log(img)
        },
        {maxWidth: 200} // Options
    );

};


// <script src="js/load-image.js"></script>
// <script src="js/load-image-orientation.js"></script>
// <script src="js/load-image-meta.js"></script>
// <script src="js/load-image-exif.js"></script>
// <script src="js/load-image-exif-map.js"></script>





document.getElementById('file-input').onchange = function (e) {
	
	if(document.getElementById("the-image")){

		var removeImage = document.getElementById("the-image");
			removeImage.parentNode.removeChild(removeImage);
	}


    loadImage(
        e.target.files[0],
        function (img) {
          var image =   document.body.appendChild(img);
            image.setAttribute('id', 'the-image');
           // console.log( getBase64Image(img) )
        },
        {maxWidth: 200} // Options
    );

    var scaledImage = loadImage.scale(
    	e.target.files[0] , // img or canvas element
    	{maxWidth: 200}
	);


    console.log( scaledImage )

};






// Download the image data using AJAX, I'm using jQuery
var imageData = $.ajax({ url: "MyImage.gif", async: false }).responseText;

// Image data updating magic
imageDataChanged = ChangeImage(imageData);

// Encode to base64, maybe try the webtoolkit.base64.js library
imageDataEncoded = Base64Encode(imageDataChanged);

// Write image data out to browser (FF seems to support this)
document.write('<img src="data:image/gif;base64,' + imageDataEncoded + '">');







document.getElementById('file-input').onchange = function (e) {
	console.log(e)
	
	// if(document.getElementById("the-image")){

	// 	var removeImage = document.getElementById("the-image");
	// 		removeImage.parentNode.removeChild(removeImage);
	// }

	var f = loadImage.scale(
	    e.target.files[0], // img or canvas element
	    {maxWidth: 600}
	);

    // var f = loadImage(
    //     e.target.files[0],
    //     function (img) {
    //       // var image =   document.body.appendChild(img);
    //       //   image.setAttribute('id', 'the-image');
    //        // console.log( getBase64Image(img) )
    //        img
    //     },
    //     {maxWidth: 200} // Options
    );
	console.log(f)


 //    var scaledImage = loadImage.scale(
 //    	e.target.files[0] , // img or canvas element
 //    	{maxWidth: 200}
	// );


 //    console.log( scaledImage )

};









var formData = new FormData();

var fileInputElement = document.getElementById("image-file")

formData.append("username", "Groucho");
formData.append("accountnum", 123456); // number 123456 is immediately converted to a string "123456"

// HTML file input, chosen by user
formData.append("userfile", fileInputElement.files[0]);

// JavaScript file-like object
var content = '<a id="a"><b id="b">hey!</b></a>'; // the body of the new file...
var blob = new Blob([content], { type: "text/xml"});

formData.append("webmasterfile", blob);

var request = new XMLHttpRequest();
request.open("POST", "http://foo.com/submitform.php");
request.send(formData);