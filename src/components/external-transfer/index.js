import React from "react";
import ParticipantActionsButtons from './ParticipantActionsButtons';
import ParticipantName from './ParticipantName';
import ParticipantStatus from './ParticipantStatus';
import ParticipantStatusContainer from './ParticipantStatusContainer';
import ConferenceButton from './ConferenceButton';
import ConferenceDialog from './ConferenceDialog';
import ConferenceMonitor from './ConferenceMonitor';

export function loadExternalTransferInterface(flex, manager, props) {

	flex.CallCanvasActions.Content.add(<ConferenceButton
		key="conference"
	/>, { sortOrder: 2 });

	flex.CallCanvas.Content.add(<ConferenceDialog
		key="conference-modal"
	/>, { sortOrder: 100 });

	// This component doesn't render anything to the UI, it just monitors
	// conference changes and takes action as necessary
	flex.CallCanvas.Content.add(<ConferenceMonitor
		key="conference-monitor"
	/>, { sortOrder: 999 });

	const isUnknownParticipant = props => props.participant.participantType === 'unknown';

	// This section is for the full width ParticipantCanvas
	flex.ParticipantCanvas.Content.remove('actions');
	flex.ParticipantCanvas.Content.add(
		<ParticipantActionsButtons
			key="custom-actions"
		/>, { sortOrder: 10 }
	);
	flex.ParticipantCanvas.Content.remove('name', { if: isUnknownParticipant });
	flex.ParticipantCanvas.Content.add(
		<ParticipantName
			key="custom-name"
		/>, { sortOrder: 1, if: isUnknownParticipant }
	);
	flex.ParticipantCanvas.Content.remove('status');
	flex.ParticipantCanvas.Content.add(
		<ParticipantStatus
			key="custom-status"
		/>, { sortOrder: 2 }
	);

	// This section is for the narrow width ParticipantCanvas, which changes to List Mode,
	// introduced in Flex 1.11.0. ListItem did not exist on ParticipantCanvas before 1.11.0.
	if (flex.ParticipantCanvas.ListItem) {
		flex.ParticipantCanvas.ListItem.Content.remove('statusContainer');
		flex.ParticipantCanvas.ListItem.Content.add(
			<ParticipantStatusContainer
				key="custom-statusContainer"
			/>, { sortOrder: 1 }
		);
		flex.ParticipantCanvas.ListItem.Content.remove('actions');
		flex.ParticipantCanvas.ListItem.Content.add(
			<ParticipantActionsButtons
				key="custom-actions"
			/>, { sortOrder: 10 }
		);
	}
}