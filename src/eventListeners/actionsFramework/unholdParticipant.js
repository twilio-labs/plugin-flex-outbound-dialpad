import { Actions } from "@twilio/flex-ui";
import { toggleHold } from '../../utilities/ConferenceService'

export function registerUnholdParticipantExtensions() {

	// External Transfer additional behavior
	Actions.replaceAction('UnholdParticipant', (payload, original) => {
		return toggleHold(payload, original, false);
	});
}