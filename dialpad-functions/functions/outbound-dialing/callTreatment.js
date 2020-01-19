const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {

	console.log("callTreament: callTreament event parameters");
	console.log("callTreament: To: ", event.To);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	// Add Environment variables to distinquish accounts 
	if (context.ACCOUNT_SID == context.ACCOUNT_SID_Y) {
		//apply call treatments for this account
		response.setBody({ To: event.To });
	}
	else {
	 	response.setBody({ To: event.To });
	}

	callback(null, response);

});