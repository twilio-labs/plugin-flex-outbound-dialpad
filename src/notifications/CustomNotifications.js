import { Notifications, NotificationType, Manager } from "@twilio/flex-ui";

const manager = Manager.getInstance();

manager.strings.websocketError = "Unable to open websocket to backend: {{url}}";
manager.strings.backendError = "Could not complete operation: {{message}}";

Notifications.registerNotification({
  id: "WebsocketError",
  content: "websocketError",
  type: NotificationType.error
});

Notifications.registerNotification({
  id: "BackendError",
  content: "backendError",
  type: NotificationType.error
});
