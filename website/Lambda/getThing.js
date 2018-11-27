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
			} else {
				console.log("Connected!");
				var sql = "SELECT things.thingid, things.thingname, convert_tz(things.thingcreated,@@session.time_zone,'America/New_York') as thingcreated, things.thinguserid, things.thingattachmentid, things.thingregistrationcode, username, filename FROM things LEFT JOIN users ON things.thinguserid = users.userid LEFT JOIN attachments ON things.thingattachmentid = attachments.attachmentid WHERE thingid = ?";
				conn.query(sql, [event.thingid], function (err, result) {
				  	if (err) {
						// This should be a "Internal Server Error" error
						
						callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
						conn.end();
				  	} else {
			  			console.log("query successful");
			  			
						callback(null, result);
						conn.end();
					} //valid username
			  	}); //query username
			}
		}); //connect database
	} //no validation errors
}; //handler