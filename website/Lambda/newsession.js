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
		};
		console.log("Connected!");
		var sql = "INSERT INTO usersessions (usersessionid, userid, expires, registrationcode) " + "VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?)";
		conn.query(sql, [event.usersessionid, event.userid, event.registrationcode], function (err, result) {
			if (err) {
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
			} else {
				console.log("new session created!");
				callback(null,"user session created!");
				conn.end();
			}
		});//end of conn.query
	});//end of conn.connect
}//end of exports.handler