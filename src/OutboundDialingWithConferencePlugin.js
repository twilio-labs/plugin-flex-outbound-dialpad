import { FlexPlugin } from "flex-plugin";
import React from "react";
import DialPadLauncher from "./components/DialPadLauncher";
import DialPad from "./components/DialPad";

import { registerReservationCreatedHandler } from "./utils/reservationCreatedHandler";

const PLUGIN_NAME = "OutboundDialingWithConferencePlugin";

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
    // Dialpad
    flex.SideNav.Content.add(<DialPadLauncher key="sidebardialerbutton" />);
    flex.ViewCollection.Content.add(
      <flex.View name="dialer" key="dialer1">
        <DialPad key="dialpadview" />
      </flex.View>
    );

    registerReservationCreatedHandler(manager);
  }
}
