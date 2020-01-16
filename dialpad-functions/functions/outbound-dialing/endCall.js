const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

function hangupCall(context, event) {

	const client = context.getTwilioClient();
	return new Promise(function (resolve, reject) {
		client
			.calls(event.CallSid)
			.update({ status: "completed" })
			.then(call => {
				console.log("terminated call: ", call.sid);
				resolve({ call: { callStatus: call.status, callSid: call.sid }, error: null });
			})
			.catch(error => {
				console.log("Failed to terminate call: ", data.callSid);
				resolve({ call: null, error });
			});
	});
}

exports.handler = TokenValidator(async function (context, event, callback) {

	console.log("endCall for: ", event.CallSid);

	const response = new Twilio.Response();

	response.appendHeader('Access-Control-Allow-Origin', '*');
	response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
	response.appendHeader('Content-Type', 'application/json');
	response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

	const hangupCallResult = await hangupCall(context, event)
	if (hangupCallResult.error) {
		response.setStatusCode(hangupCallResult.error.status)
	}
	response.setBody(hangupCallResult);

	callback(null, response);

});