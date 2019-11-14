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

const updateSyncDoc = (context, event) => {

	const client = context.getTwilioClient();
	const syncService = client.sync.services(context.TWILIO_SYNC_SERVICE_SID);

	return new Promise(function (resolve, reject) {

		client.calls(event.callSid)
			.fetch()
			.then(call => {

				syncService.documents(event.syncDocName)
					.update({
						data: {
							autoDial: false,
							call: {
								callSid: call.sid,
								callStatus: call.status
							}
						}
					})
					.then(() => resolve())
					.catch(error => {
						console.log("ERROR updating sync map: ", error);
						resolve();
					})
			})
			.catch(error => {
				console.log("Unable to retrieve call for sid:", event.callSid);
				resolve()
			})
	})
}

exports.handler = async function (context, event, callback) {

	console.log("forceUpdateSyncDoc request parameters:");
	console.log("callSid:", event.callSid);
	console.log("syncDocName: ", event.syncDocName);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	const tokenResponse = await getAuthentication(event.token, context);

	if (tokenResponse.valid) {
		await updateSyncDoc(context, event)
	} else {
		response.setStatusCode(401);
		response.setBody({
			status: 401,
			message: 'Your authentication token failed validation',
		});
	}

	callback(null, response);

}