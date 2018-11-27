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
			}
			console.log("Connected!");
			var sql = "SELECT userid, username, email, isadmin FROM users WHERE userid = ?";
			
		conn.query(sql, [event.userid], function (err, result) {
		  	if (err) {
				// This should be a "Internal Server Error" error
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
					console.log("internal server error");
		  	} else {
		  		var json = { 
							userid : event.userid,
							username : event.username,
							email : event.email,
							isadmin : event.isadmin
						};
		  		console.log("gotThing");
		  		callback(null, json);
		  		conn.end();
		  		//successful logout
				} //good code count
		  	}); //query logout codes
		}); //connect database
	} //no validation errors
}; //handler
