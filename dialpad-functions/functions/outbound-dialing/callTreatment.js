const nodeFetch = require('node-fetch');

async function getAuthentication(token, context) {

	console.log('callTreament: Validating request token');

	const tokenValidationApi = `https://${context.ACCOUNT_SID}:${context.AUTH_TOKEN}@iam.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Tokens/validate`;

	const fetchResponse = await nodeFetch(tokenValidationApi, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			token
		})
	});

	const tokenResponse = await fetchResponse.json();
	return tokenResponse;
}

exports.handler = async function (context, event, callback) {

	console.log("callTreament: callTreament event parameters");
	console.log("callTreament: To: ", event.To);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	const tokenResponse = await getAuthentication(event.token, context);

	if (tokenResponse.valid) {
		// Add Environment variables to distinquish accounts 
		if (context.ACCOUNT_SID == context.ACCOUNT_SID_Y) {
			//apply call treatments for this account
			response.setBody({ To: event.To });
		}
		else {
			response.setBody({ To: event.To });
		}
	} else {
		response.setStatusCode(401);
		response.setBody({
			status: 401,
			message: 'Your authentication token failed validation',
		});
	}

	callback(null, response);

}