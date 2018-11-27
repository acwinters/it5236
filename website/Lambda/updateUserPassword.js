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
		//attempts to connect to the database
		conn.connect(function(err) {
		  	if (err)  {
				// This should be a "Internal Server Error" error				
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));				
			} else {
				console.log("Connected!");
				var sql = "UPDATE users SET passwordhash= ? WHERE userid = ?";				
				conn.query(sql, [event.passwordHash, event.userid], function (err, result) {
					if (err) {
						// This should be a "Internal Server Error" error
						callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
				  	}else {
						console.log("password updated");
						callback(null,"password updated");
						conn.end()
					}					
				});
			}
		});//connect database
	}//no validation errors	
}//handler