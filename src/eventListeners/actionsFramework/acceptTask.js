import { Actions } from "@twilio/flex-ui";

export function registerAcceptTaskOverrides() {
  Actions.replaceAction("AcceptTask", (payload, original) => {
    console.log("ACCEPT TASK: ", payload);
    const task = payload.task;

    // handle calls from twilio clients "client:<name>"
    if (task.attributes.to === "") {
      payload.conferenceOptions.from = task.attributes.from;
    }

    // handle outbound calls
    if (
      task.attributes.type === "outbound" &&
      task.taskChannelUniqueName === "voice"
    ) {
      payload.conferenceOptions.from = task.attributes.from;
    }

    original(payload);
  });
}
