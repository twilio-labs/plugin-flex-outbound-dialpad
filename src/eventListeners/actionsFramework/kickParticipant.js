import { Actions } from "@twilio/flex-ui";
import ConferenceService from '../../utilities/ConferenceService'

export function registerKickParticipantExtensions() {

	// External Transfer additional behavior
	Actions.replaceAction('KickParticipant', (payload, original) => {
		const { task, targetSid, participantType } = payload;

		if (participantType === 'worker') {
			return original(payload);
		}

		const conference = task.attributes.conference.sid;
		const participantSid = targetSid;

		console.log(`Removing participant ${participantSid} from conference`);
		return ConferenceService.removeParticipant(conference, participantSid);
	});
}