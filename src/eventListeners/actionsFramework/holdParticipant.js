import { Actions } from "@twilio/flex-ui";
import { toggleHold } from '../../utilities/ConferenceService'

export function registerHoldParticipantExtensions() {

	// External Transfer additional behavior
	Actions.replaceAction('HoldParticipant', (payload, original) => {
		return toggleHold(payload, original, true);
	});
}