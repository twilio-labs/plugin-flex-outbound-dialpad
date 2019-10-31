import React from "react";
import DialPadLauncher from "./DialPadLauncher";

export function loadDialPadInterface(flex, manager) {

	flex.SideNav.Content.add(
		<DialPadLauncher
			key="sidebardialerbutton"
		/>
	);

}