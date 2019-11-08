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

function makeOutboundCall(context, event) {
	const client = context.getTwilioClient();

	return new Promise(function (resolve, reject) {
		const callHandlerCallbackURL = encodeURI(
			"https://" +
			event.functionsDomain +
			"/outbound-dialing/callHandlerTwiml?workerContactUri=" +
			event.workerContactUri
		);

		const statusCallbackURL = encodeURI(
			"https://" +
			event.functionsDomain +
			"/outbound-dialing/callStatusUpdateHandler?workerSyncDoc=" +
			event.workerContactUri +
			".outbound-call" +
			"&workerSid=" +
			event.workerSid
		);

		client.calls
			.create({
				url: callHandlerCallbackURL,
				to: event.To,
				from: event.From,
				statusCallback: statusCallbackURL,
				statusCallbackEvent: ["ringing", "answered", "completed"]
			})
			.then(call => {
				console.log("call created: ", call.sid);
				resolve({ call: call, error: null });
			})
			.catch(error => {
				console.log("call creation failed");
				resolve({ call: null, error });
			});
	});
}

exports.handler = async function (context, event, callback) {

	console.log("makeCall request parameters:");
	console.log("to:", event.To);
	console.log("from:", event.From);
	console.log("workerContactUri:", event.workerContactUri);
	console.log("callbackDomain:", event.functionsDomain);
	console.log("workerSid", event.workerSid);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	const tokenResponse = await getAuthentication(event.token, context);

	if (tokenResponse.valid) {
		const makeCallResult = await makeOutboundCall(context, event)
		if (makeCallResult.error) {
			response.setStatusCode(makeCallResult.error.status)
		}
		response.setBody(makeCallResult);
	} else {
		response.setStatusCode(401);
		response.setBody({
			status: 401,
			message: 'Your authentication token failed validation',
		});
	}

	callback(null, response);

}