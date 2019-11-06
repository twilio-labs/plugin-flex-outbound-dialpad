/*
 Function for triggering an outbound call from a third part application
 */
exports.handler = async function (context, event, callback) {

	console.log("number to dial: ", event.To);
	console.log("workerSyncDoc:", event.workerSyncDoc);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	const client = context.getTwilioClient();
	const syncService = client.sync.services(context.TWILIO_SYNC_SERVICE_SID);

	syncService.documents(event.workerSyncDoc)
		.update({
			data: {
				remoteOpen: true,
				numberToDial: event.To,
			}
		}).then(newDoc => {
			callback(null, response);
		})
};