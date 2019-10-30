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
		var callHandlerCallbackURL = encodeURI(
			"https://" +
			event.functionsDomain +
			"/outbound-dialing/callHandlerTwiml?workerContactUri=" +
			event.workerContactUri
		);

		var statusCallbackURL = encodeURI(
			"https://" +
			event.functionsDomain +
			"/outbound-dialing/callStatusUpdateHandler?workerSyncDoc=" +
			event.workerContactUri +
			".outbound-call"
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
				console.debug("call created: ", call.sid);
				console.debug("\tto:\t", call.to);
				console.debug("\tfrom:\t", call.from);
				console.debug("\tstatus:\t", call.status.toString());
				resolve({ success: true, call: call });
			})
			.catch(error => {
				console.error("call creation failed");
				console.error("\tERROR: ", error.message);
				resolve({ success: false, error: error });
			});
	});
}

exports.handler = async function (context, event, callback) {

	console.debug("makeCall for:");
	console.debug("\tto:", event.To);
	console.debug("\tfrom:", event.From);
	console.debug("\tworkerContactUri:", event.workerContactUri);
	console.debug("\tcallbackDomain:", event.functionsDomain);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	const tokenResponse = await getAuthentication(event.token, context);

	if (tokenResponse.valid) {
		const makeCallResult = await makeOutboundCall(context, event)
		if (!makeCallResult.success) {
			response.setStatusCode(500)
		}
		response.setBody(makeCallResult)
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