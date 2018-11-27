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
				var sql = "SELECT email, userid FROM users WHERE username = ? OR email = ?";			
				conn.query(sql, [event.usernameOrEmail, event.usernameOrEmail], function (err, result) {
				  	if (err) {
						// This should be a "Internal Server Error" error			  			
						callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
						conn.end();
				  	} else if(result.length != 1){
			  			console.log("email or username not found");
			  			errors.push("email or username not found");			  			
						callback(formatErrorResponse('BAD_REQUEST', errors));
						conn.end();
					} else {
						console.log("username/email found!");
						var userid = result[0].userid;
						var email = result[0].email;
						sql = "INSERT INTO passwordreset (passwordresetid, userid, email, expires) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))";
						conn.query(sql, [event.passwordresetid, userid, email], function (err, result) {
							if (err) {
								// This should be a "Internal Server Error" error
								callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
								conn.end();
				  			} else if(result.affectedRows != 1){
			  					console.log("Could not delete validation id");
			  					errors.push("There was an error validating your email");
			  					
								callback(formatErrorResponse('BAD_REQUEST', errors));
								conn.end();
							} else {
								console.log("created pw reset!");
								callback(null, email);
								conn.end();
							}
						});
					}//valid username
			  	}); //query username
			}
		}); //connect database
	} //no validation errors
}; //handler