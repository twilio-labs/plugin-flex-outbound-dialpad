import { Actions } from "@twilio/flex-ui";

export function registerAcceptTaskOverrides() {
  Actions.replaceAction("AcceptTask", (payload, original) => {
    console.log("ACCEPT TASK: ", payload);
    const task = payload.task;

    if (
      task.attributes.type === "outbound" &&
      task.taskChannelUniqueName === "voice"
    ) {
      payload.conferenceOptions.from = task.attributes.from;
    }

    original(payload);
  });
}
