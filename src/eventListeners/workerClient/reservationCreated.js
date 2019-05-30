import { Actions } from "@twilio/flex-ui";

var IsOutbound = false;

export function registerReservationCreatedHandler(manager) {
  manager.workerClient.on("reservationCreated", handleReservationTask);
}

export function takeOutboundCall() {
  IsOutbound = true;

  Actions.invokeAction("SetActivity", {
    activityName: "Idle"
  }).catch(error => {
    console.error(
      "Attempted to go idle but activity not available, trying 'Available'"
    );
    Actions.invokeAction("SetActivity", {
      activityName: "Available"
    }).catch(error => {
      console.error(
        "Attempted to auto switch to Idle state but activity doesnt exist, try remapping which state to auto switch to"
      );
    });
  });
}

function handleReservationTask(reservation) {
  if (IsOutbound) {
    console.log("RESERVATION ATTS:", reservation.task.attributes);
    if (
      reservation.task.attributes.type === "outbound" &&
      reservation.task.attributes.autoAnswer === "true"
    ) {
      Actions.invokeAction("NavigateToView", {
        viewName: "agent-desktop"
      });
      Actions.invokeAction("SelectTask", {
        sid: reservation.sid
      });
      Actions.invokeAction("AcceptTask", {
        sid: reservation.sid
      });

      IsOutbound = false;
    } else if (reservation.task.taskChannelUniqueName === "voice") {
      // console.log("reject else ", reservation)
      Actions.invokeAction("RejectTask", {
        sid: reservation.sid
      });
    }
  }
}
