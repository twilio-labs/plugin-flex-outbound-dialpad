exports.handler = async function (context, event, callback) {

	console.log("callhandler for: ", event.CallSid);
	console.log("\tworker:\t", event.workerContactUri);
	console.log("\tto:\t", event.To);
	console.log("\tworkflowSid:\t", context.TWILIO_WORKFLOW_SID);

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

