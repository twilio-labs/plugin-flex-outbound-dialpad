import { registerAcceptTaskExtensions } from "./acceptTask";
import { registerHoldParticipantExtensions } from "./holdParticipant";
import { registerUnholdParticipantExtensions } from "./unholdParticipant";
import { registerKickParticipantExtensions } from "./kickParticipant";
import { registerMonitorCallExtensions } from "./monitorCall";

export function registerActionExtensions() {
	registerAcceptTaskExtensions();
	registerHoldParticipantExtensions();
	registerUnholdParticipantExtensions();
	registerKickParticipantExtensions();
	registerMonitorCallExtensions();
}
