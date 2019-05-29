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
