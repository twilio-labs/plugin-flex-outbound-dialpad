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
  manager.strings.activityStateUnavailable = "Tried to switch to programmed Activity State but State {{state1}} or {{state2}} arent unavailable";

  Notifications.registerNotification({
    id: "ActivityStateUnavailable",
    content: "activityStateUnavailable",
    type: NotificationType.error
  });
}
