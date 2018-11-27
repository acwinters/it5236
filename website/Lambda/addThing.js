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
				host     : config.dbhost,
				user     : config.dbuser,
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
			};
			console.log("Connected!");
			var sql = "INSERT INTO things (thingid, thingname, thingcreated, thinguserid, thingattachmentid, thingregistrationcode) VALUES (?, ?, NOW(), ?, ?, ?)";
			conn.query(sql, [event.thingid, event.thingname, event.thingcreated, event.thinguserid, event.thingattachtmentid], function (err, result) {
				if (err) {
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
				} else {
					console.log("thing added!");
					callback(null,"thing added");
					conn.end();
				}
				
			});
		});//end of connection function
	}
}// end of exports.handler