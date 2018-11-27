var mysql = require('./node_modules/mysql');
var config = require('./config.json');

function formatErrorResponse(code, errs) {
	return JSON.stringify({
		error  : code,
		errors : errs
	});
}

exports.handler = (event, context, callback) => {
	var conn = mysql.createConnection({
		host 	 : config.dbhost,
		user 	 : config.dbuser,
		password : config.dbpassword,
		database : config.dbname
	});
	//instruct the function to return as soon as the callback is invoked
	context.callbackWaitsForEmptyEventLoop = false;
	conn.connect(function(err) {
		if (err)  {
			//return internal error
			callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		};
		console.log("Connected!");
		var sql = "DELETE FROM usersessions WHERE usersessionid = ? OR expires < now()";

		conn.query(sql, [event.sessionid], function (err, result) {
		    if (err) {
				//return internal error
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
		  	} else {
		    	callback(null,"user logged out");
		  	}
		});
	});
};