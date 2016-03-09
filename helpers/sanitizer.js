var sanitizeHtml = require('sanitize-html');

var sanitize = function(dirty) {
	var cleanedHTML = function(){
		return sanitizeHtml(dirty, {
		  allowedTags: [ "p", "ul", "li", "a", "em", "strong", "br" ],
		})
	}
	
	var noTagsCleanedHTML = function(){
		return sanitizeHtml(dirty, {
		  allowedTags: [],
		})
	}

	var cleanedHTMLCHAR = function(){
		return sanitizeHtml(dirty, {
		  allowedTags: [],
		}).replace(/[^a-zA-Z0-9,.-\s]/gi, "")
		  .replace(/^\s+|\s+$/g, "")
		  .replace(/^\.+/g, "")
		  .replace(/^\-+|\-+$/g, "")
		  .replace(/^\,+|\,+$/g, "");
		// return sanitizeHtml(dirty, {
		//   allowedTags: [],
		// })
	}

	var personEntity = function(){
		if( dirty !== "person" && dirty !== "entity"){
			return ("person")
		}
		var cleaned = dirty
		return cleaned
	}

	// var namefieldclean = function(){

	// 	var removeUnwantedCharacters = 
	// 	return sanitizeHtml(dirty, {
	// 	  allowedTags: [],
	// 	})
	// }

	return{
		cleanedHTML: cleanedHTML,
		noTagsCleanedHTML: noTagsCleanedHTML,
		cleanedHTMLCHAR: cleanedHTMLCHAR,
		personEntity: personEntity
	}
}

module.exports = sanitize;