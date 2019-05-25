import { Notifications, NotificationType, Manager } from "@twilio/flex-ui";

const manager = Manager.getInstance();

manager.strings.websocketError = "Unable to open websocket to backend: {{url}}";
Notifications.registerNotification({
  id: "WebsocketError",
  content: "websocketError",
  type: NotificationType.error
});
