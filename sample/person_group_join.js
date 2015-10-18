
	

return Hub.find(req.params.id, function(err, hub){
			if(err || hub === null){ 	
				req.flash('info', "Hub not found.")
				res.redirect('/hubs');
				return console.log("err++: " + err) 	
			}


			// var group = new Group();

			// group.hub_id = mongoose.Types.ObjectId(req.params.id);
			// group.title = req.body.title;
			// group.description = req.body.description;

			// group.save(function (err, group) {
			// 	if(err || group === null){ 	
			// 		req.flash('info', "Did not save group.")
			// 		res.redirect('/hub/' + req.params.id+ '/add_group');
			// 		return console.log("err++: " + err) 	
			// 	}	
			// 	res.redirect('/hub/' + req.params.id+ '/groups');

			// });		
		})	

var group_save = function(){

	var group = new Group();

	group.hub_id = mongoose.Types.ObjectId(req.params.id);
	group.title = req.body.title;
	group.description = req.body.description;

	group.save(function (err, group) {
		if(err || group === null){ 	
			req.flash('info', "Did not save group.")
			res.redirect('/hub/' + req.params.id+ '/add_group');
			return console.log("err++: " + err) 	
		}	
		res.redirect('/hub/' + req.params.id+ '/groups');

	});	

}


var hubId = function(method){

	return Hub.find(req.params.id, function(err, hub){
			if(err || hub === null){ 	
				req.flash('info', "Hub not found.")
				res.redirect('/hubs');
				return console.log("err++: " + err) 	
			}
			return method			
		})	
}

hubId(group_save());


	//**************** ADD PERSONS **********************
	app.get('/hub/:id/group/:group_id/add_persons', function (req, res) {
			

		Group.findById(req.params.id, function (err, group) {	


			return Person.find({}, null, function(err, persons){
			  if(err){ return console.log("err: " + err) }
				// console.log(persons);
			  res.render('group/add_persons', {group : group, persons : persons});
				// res.send(persons)
			});


			// console.log(group);
			

		});

	});






	function personAdd(req,res,next){
		var person = req.body.person;

		if(person === undefined){
			person = [];
		}

		if(person.constructor !== Array && person.constructor !== undefined){
			person = [req.body.person];
		}



		Group.findById(req.params.id, function(err, originA){
		    if(err){ return console.log("err: " + err) }

			var originA = originA;
			console.log("originA " + originA.persons);
			
			Group.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){
				if(err){ return console.log("err: " + err) }

					var affected = affected;

				Group.findById(req.params.id, function(err, originB){
					console.log("originB " + originB.persons);

					var removeArray = _.difference(originA.persons, originB.persons);
					// console.log(removeArray);
					removeArray.forEach(function(element){
						// console.log("element: " +element)
						Person.findById(element, function(err, entry){
							console.log(entry.group)
							var result = _.without(entry.group, req.params.id);
							console.log(result)

							if(result === undefined){
								result = [];
							}
							if(result.constructor !== Array && result.constructor !== undefined){
								result = [result];
							}

							Person.findByIdAndUpdate(element, { $set: {group: result}}, function(err, entryNext){
						
							})

						})

					})

					
				})


				person.forEach(function(entry){
					


					Person.findByIdAndUpdate(entry, { $addToSet: {group: req.params.id}}, function(err, entry){
						
					})
				});//end of for each
	    		res.redirect('/group/'+req.params.id+'/add_persons' );
			});	

		})
		next();
	}

	app.post('/group/:id/add_persons',[personAdd], function (req, res) {

		// res.redirect('/group/'+req.params.id+'/add_persons' );

		// var person = req.body.person;

		// if(person === undefined){
		// 	person = [];
		// }

		// if(person.constructor !== Array && person.constructor !== undefined){
		// 	person = [req.body.person];
		// }

		// Group.findByIdAndUpdate(req.params.id,{ $set: { persons: person }}, function(err, affected){

		// 	person.forEach(function(entry){
		// 		Person.findByIdAndUpdate(entry, { $push: {group: req.params.id}}, function(err, entry){
					
		// 		})
		// 	});//end of for each
  //   		// res.redirect('/group/'+req.params.id+'/add_persons' );
		// });
	});


}

