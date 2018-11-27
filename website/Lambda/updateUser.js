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
	var sql_parameters = new Array(event.username, event.email);
	var password_sql = "";
	var isadmin_sql = "";
	if(event.passwordhash!=undefined){
		sql_parameters.push(event.passwordhash);
		password_sql = ", passwordhash=?";
	} 
	if((event.isadmin!=undefined) && ((event.isadmin==1)||(event.isadmin==0))){
		sql_parameters.push(event.isadmin);
		isadmin_sql = ", isadmin=?";
	}
	sql_parameters.push(event.userid);
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
				callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));conn.end();
			};
			console.log("Connected!");
			var sql = "UPDATE users SET username=?, email=?"+password_sql+isadmin_sql+" WHERE userid = ?";		
			conn.query(sql, sql_parameters,function (err, result) {
			  	if (err) {
					// This should be a "Internal Server Error" error					
					callback(formatErrorResponse('INTERNAL_SERVER_ERROR', [err]));
					conn.end();
			  	} else {
		  			console.log("User Updated!");		  			
					callback(null, result);
					conn.end();
				} //valid username
		  	}); //query username
		}); //connect database
	} //no validation errors
}; //handler