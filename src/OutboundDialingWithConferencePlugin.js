import { FlexPlugin } from "flex-plugin";
import React from "react";
import DialPadLauncher from "./components/DialPadLauncher";
import DialPad from "./components/DialPad";

import { registerReservationCreatedHandler } from "./eventListeners/workerClient/reservationCreated";

import { registerAcceptTaskOverrides } from "./eventListeners/actionsFramework/acceptTask";

import "./notifications/CustomNotifications";

const PLUGIN_NAME = "OutboundDialingWithConferencePlugin";

export default class OutboundDialingWithConferencePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
    this.backendHostname = "backend-hostname.com";
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
      />
    );

    registerReservationCreatedHandler(manager);
    registerAcceptTaskOverrides();
  }
}
