import { FlexPlugin } from "flex-plugin";
import React from "react";
import DialPadLauncher from "./components/dialpad/DialPadLauncher";
import { loadExternalTransferInterface } from "./components/external-transfer"

import { registerReservationCreatedExtensions } from "./eventListeners/workerClient/reservationCreated";

import { registerActionExtensions } from "./eventListeners/actionsFramework"

import "./notifications/CustomNotifications";

const PLUGIN_NAME = "OutboundDialingWithConferencePlugin";

export default class OutboundDialingWithConferencePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
    this.backendHostname = "backend-hostname.com";
    this.fromNumber = "+11234567890"; // twilio account or verified number
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    // Add Dialpad
    flex.SideNav.Content.add(
      <DialPadLauncher
        key="sidebardialerbutton"
        backendHostname={this.backendHostname}
        fromNumber={this.fromNumber}
      />
    );

    loadExternalTransferInterface(flex, manager, this.props)
    registerReservationCreatedExtensions(manager);
    registerActionExtensions();
  }
}
