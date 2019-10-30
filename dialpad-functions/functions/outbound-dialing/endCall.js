const nodeFetch = require('node-fetch');

async function getAuthentication(token, context) {

	console.log('Validating request token');

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

function hangupCall(context, event) {

	const client = context.getTwilioClient();
	return new Promise(function (resolve, reject) {
		client
			.calls(event.CallSid)
			.update({ status: "completed" })
			.then(call => {
				console.debug("terminated call: ", call.sid);
				console.debug("\tto: ", call.to);
				console.debug("\tfrom: ", call.from);
				console.debug("\tstatus: ", call.status.toString());
				resolve({ success: true, call: call });
			})
			.catch(error => {
				console.error("Failed to terminate call: ", data.callSid);
				console.error("\tERROR: ", error);

				resolve({ success: false, error: error });
			});
	});
}

exports.handler = async function (context, event, callback) {

	console.debug("endCall for: ", event.CallSid);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	const tokenResponse = await getAuthentication(event.token, context);
	if (tokenResponse.valid) {
		const hangupCallResult = await hangupCall(context, event)
		if (!hangupCallResult.success) {
			response.setStatusCode(500)
		}
		response.setBody(hangupCallResult)
		callback(null, response);
	} else {
		response.setStatusCode(401);
		response.setBody({
			status: 401,
			message: 'Your authentication token failed validation',
		});
		callback(null, response);
	}

}