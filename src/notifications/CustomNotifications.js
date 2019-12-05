import { Notifications, NotificationType, Manager } from "@twilio/flex-ui";

const manager = Manager.getInstance();

// To avoid collision with other plugin using same notification
if (!manager.strings.websocketError) {
  manager.strings.websocketError =
    "Unable to open websocket to backend: {{url}}";
  Notifications.registerNotification({
    id: "WebsocketError",
    content: "websocketError",
    type: NotificationType.error
  });
}

if (!manager.strings.backendError) {
  manager.strings.backendError = "Could not complete operation: {{message}}";

  Notifications.registerNotification({
    id: "BackendError",
    content: "backendError",
    type: NotificationType.error
  });
}

if (!manager.strings.activityStateUnavailable) {
  manager.strings.activityStateUnavailable = "Tried to switch to programmed Activity State but State {{state1}} or {{state2}} are not configured";

  Notifications.registerNotification({
    id: "ActivityStateUnavailable",
    content: "activityStateUnavailable",
    type: NotificationType.error
  });
}

if (!manager.strings.cantDialOut) {
  manager.strings.cantDialOut = "You cannot make a call while active with another call, please make sure any voice tasks have been wrapped up";

  Notifications.registerNotification({
    id: "CantDialOut",
    content: "cantDialOut",
    type: NotificationType.warning
  });
}

if (!manager.strings.cantCloseDialpad) {
  manager.strings.cantCloseDialpad = "You cannot close the dialpad when a call has been started, please wait for it to be answered or hang up";

  Notifications.registerNotification({
    id: "CantCloseDialpad",
    content: "cantCloseDialpad",
    type: NotificationType.warning
  });
}

if (!manager.strings.unableToConnect) {
  manager.strings.unableToConnect = "The number you are dialing responded with: {{message}}";

  Notifications.registerNotification({
    id: "UnableToConnect",
    content: "unableToConnect",
    type: NotificationType.warning,
    timeout: 6000
  });
}