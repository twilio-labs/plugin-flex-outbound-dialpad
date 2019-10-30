exports.handler = async function (context, event, callback) {

	console.debug("callhandler for: ", event.CallSid);
	console.debug("\tworker:\t", event.workerContactUri);
	console.debug("\tto:\t", event.To);
	console.debug("\tworkflowSid:\t", context.TWILIO_WORKFLOW_SID);

	var taskAttributes = {
		targetWorker: event.workerContactUri,
		autoAnswer: "true",
		type: "outbound",
		direction: "outbound",
		name: event.To
	};

	let twiml = new Twilio.twiml.VoiceResponse();

	var enqueue = twiml.enqueue({
		workflowSid: `${context.TWILIO_WORKFLOW_SID}`
	});

	enqueue.task(JSON.stringify(taskAttributes));
	callback(null, twiml);
}

