exports.handler = async function (context, event, callback) {

	console.log("callhandler for: ", event.CallSid);
	console.log("worker:", event.workerContactUri);
	console.log("to:", event.To);
	console.log("workflowSid:", context.TWILIO_WORKFLOW_SID);

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

