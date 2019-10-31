import { registerAcceptTaskExtensions } from "./acceptTask";
import { registerHoldParticipantExtensions } from "./holdParticipant";
import { registerUnholdParticipantExtensions } from "./unholdParticipant";
import { registerKickParticipantExtensions } from "./kickParticipant";

export function registerActionExtensions() {
	registerAcceptTaskExtensions();
	registerHoldParticipantExtensions();
	registerUnholdParticipantExtensions();
	registerKickParticipantExtensions();
}
