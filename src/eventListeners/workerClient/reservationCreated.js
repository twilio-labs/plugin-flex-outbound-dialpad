import { Actions, Notifications } from "@twilio/flex-ui";

var IsOutbound = false;

export function registerReservationCreatedExtensions(manager) {
  manager.workerClient.on("reservationCreated", handleReservationTask);
}

export function takeOutboundCall() {
  console.log("OUTBOUND DIALPAD: Entering Outbound Only");
  IsOutbound = true;

  return new Promise((resolve, reject) => {
    Actions.invokeAction("SetActivity", {
      activityName: "Idle"
    })
      .then(() => {
        resolve()
      })
      .catch(() => {
        Actions.invokeAction("SetActivity", {
          activityName: "Available"
        })
          .then(() => resolve())
          .catch(() => {
            Notifications.showNotification("ActivityStateUnavailable", {
              state1: "Idle",
              state2: "Available"
            });
          });
      });
  });
}

function handleReservationTask(reservation) {
  if (IsOutbound) {
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

      console.log("OUTBOUND DIALPAD: Exiting Outbound Only");
      IsOutbound = false;
    } else if (reservation.task.taskChannelUniqueName === "voice") {
      Actions.invokeAction("RejectTask", {
        sid: reservation.sid
      });
    }
  }
}
