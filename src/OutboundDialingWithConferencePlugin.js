import { FlexPlugin } from "flex-plugin";
import { SyncClient } from "twilio-sync";
import { Manager } from "@twilio/flex-ui";

//independent features
import { loadDialPadInterface } from "./components/dialpad"
import { loadExternalTransferInterface } from "./components/external-transfer"

// common libraries
import { registerReservationCreatedExtensions } from "./eventListeners/workerClient/reservationCreated";
import { registerActionExtensions } from "./eventListeners/actionsFramework"

import "./notifications/CustomNotifications";

const PLUGIN_NAME = "OutboundDialingWithConferencePlugin";

export const FUNCTIONS_HOSTNAME = 'dialpad-functions-4229-dev.twil.io';
export const DEFAULT_FROM_NUMBER = "+12565769948"; // twilio account or verified number
export const SYNC_CLIENT = new SyncClient(Manager.getInstance().user.token);

export default class OutboundDialingWithConferencePlugin extends FlexPlugin {


  constructor() {
    super(PLUGIN_NAME);

  }


  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    // Add custom extensions
    loadDialPadInterface.bind(this)(flex, manager);
    loadExternalTransferInterface.bind(this)(flex, manager)
    registerReservationCreatedExtensions(manager);
    registerActionExtensions();
  }
}
