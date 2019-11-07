import { Actions } from "@twilio/flex-ui";

var IsOutbound = false;

export function registerReservationCreatedExtensions(manager) {
  manager.workerClient.on("reservationCreated", handleReservationTask);
}

export function blockForOutboundCall() {
  console.log("OUTBOUND DIALPAD: Entering Outbound Only");
  IsOutbound = true;
}

export function unblockForOutBoundCall() {
  console.log("OUTBOUND DIALPAD: Exiting Outbound Only");
  IsOutbound = false;
}



function handleReservationTask(reservation) {
  if (IsOutbound) {
    if (
      reservation.task.attributes.type === "outbound" &&
      reservation.task.attributes.autoAnswer === "true"
    ) {
      console.time("AcceptTask");
      Actions.invokeAction("AcceptTask", {
        sid: reservation.sid
      });
      console.timeEnd("AcceptTask");

      console.time("navigate");
      Actions.invokeAction("NavigateToView", {
        viewName: "agent-desktop"
      });
      console.timeEnd("navigate");

      console.time("selectTask");
      Actions.invokeAction("SelectTask", {
        sid: reservation.sid
      });
      console.timeEnd("selectTask");

      unblockForOutBoundCall();

    } else if (reservation.task.taskChannelUniqueName === "voice") {
      Actions.invokeAction("RejectTask", {
        sid: reservation.sid
      });
    }
  }
}
