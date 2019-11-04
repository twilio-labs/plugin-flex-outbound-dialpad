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
				console.log("call created: ", call.sid);
				console.log("\tto:\t", call.to);
				console.log("\tfrom:\t", call.from);
				console.log("\tstatus:\t", call.status.toString());
				resolve({ success: true, call: call });
			})
			.catch(error => {
				console.log("call creation failed");
				console.log("\tERROR: ", error.message);
				resolve({ success: false, error: error });
			});
	});
}

exports.handler = async function (context, event, callback) {

	console.log("makeCall for:");
	console.log("\tto:", event.To);
	console.log("\tfrom:", event.From);
	console.log("\tworkerContactUri:", event.workerContactUri);
	console.log("\tcallbackDomain:", event.functionsDomain);

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