import { Actions } from "@twilio/flex-ui";

export function registerMonitorCallExtensions() {

	Actions.replaceAction("MonitorCall", (payload, original) => {
		console.log("MONITOR CALL: ", payload);
		const task = payload.task;

		// handle outbound calls
		if (
			task.attributes.type === "outbound" &&
			task.taskChannelUniqueName === "voice"
		) {
			payload.extraParams = { "From": task.attributes.from }
		}

		console.log("NEW PAYLOAD FOR MONITOR CALL: ", payload);
		original(payload);
	});
}
