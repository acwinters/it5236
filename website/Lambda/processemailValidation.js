var mysql = require('./node_modules/mysql');
var config = require('./config.json');

function formatErrorResponse(code, errs) {
	return JSON.stringify({ 
		error  : code,
		errors : errs
	});
}

exports.handler = (event, context, callback) => {	
	context.callbackWaitsForEmptyEventLoop = false;
	var errors = new Array();
	if(errors.length > 0) {
		// This should be a "Bad Request" error
		console.log("BAD REQUEST");
		callback(formatErrorResponse('BAD_REQUEST', errors));
	} else {
		//get connection
			var conn = mysql.createConnection({
				host 	 : config.dbhost,
				user 	 : config.dbuser,
				password : config.dbpassword,
				database : config.dbname
			});		
		//prevent timeout from waiting event loop
		context.callbackWaitsForEmptyEventLoop = false;
		//attempts to connect to the database
		conn.connect(function(err) {
			if (err)  {
				// This should be a "Internal Server Error" error		  		
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
				conn.end();
			} else {
				console.log("Connected!");
				var sql = "SELECT userid FROM emailvalidation WHERE emailvalidationid = ?";			
				conn.query(sql, [event.emailvalidationid], function (err, result) {
				  	if (err) {
						// This should be a "Internal Server Error" error
						callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
				  	} else if(result.length != 1){
			  			console.log("Emaill not validated");
			  			errors.push("Email not validated");			  			
						callback(formatErrorResponse('BAD_REQUEST', errors));
					} else {
						console.log("Validated!");
						var userid = result[0].userid;
						sql = "DELETE FROM emailvalidation WHERE emailvalidationid = ?";
						conn.query(sql, event.emailvalidationid, function (err, result) {
							if (err) {
								// This should be a "Internal Server Error" error
								callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));

				  			} else if(result.affectedRows != 1){
			  					console.log("Could not delete validation id");
			  					errors.push("There was an error validating your email");
			  					
								callback(formatErrorResponse('BAD_REQUEST', errors));
							} else {
								console.log("Validation removed!");
								sql = "UPDATE users SET emailvalidated = 1 WHERE userid = ?";
								conn.query(sql, [userid], function (err, result) {
									if (err) {
										// This should be a "Internal Server Error" error										
										callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
						  			} else if(result.affectedRows != 1){
					  					console.log("Could not find userid");
					  					errors.push("There was an error validating your email");
										callback(formatErrorResponse('BAD_REQUEST', errors));										
									} else {
										console.log("Email validated!");
										callback(null,"Email validated!");
										conn.end();
									}
								});
							}
						});
					}//valid username
			  	}); //query username
			}
		}); //connect database
	} //no validation errors
}; //handler