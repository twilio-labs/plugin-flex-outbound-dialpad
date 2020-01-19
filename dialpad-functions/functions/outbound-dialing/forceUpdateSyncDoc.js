const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

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

exports.handler = TokenValidator(async function (context, event, callback) {

	console.log("forceUpdateSyncDoc request parameters:");
	console.log("callSid:", event.callSid);
	console.log("syncDocName: ", event.syncDocName);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	await updateSyncDoc(context, event)

	callback(null, response);

});