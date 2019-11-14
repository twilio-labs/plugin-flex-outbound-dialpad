import * as React from "react";

import { SideLink, Notifications } from "@twilio/flex-ui";
import Dialog from "@material-ui/core/Dialog";
import PropTypes from "prop-types";
import DialPad from "./DialPad";
import Close from "@material-ui/icons/Close";
import styled from "react-emotion";
import { withStyles } from "@material-ui/core/styles";
import { CallStatus, RingingService, DialpadSyncDoc } from '../../utilities/DialPadUtil'

const StyledDialog = withStyles({
  root: {
    width: "100%"
  }
})(({ classes, ...other }) => <Dialog className={classes.root} {...other} />);


class DialPadDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      autoDial: false,
      numberToDial: "",
      call: { callSid: "", callStatus: "" }
    };

    this.setCallState = this.setCallState.bind(this);
    this.setNumberState = this.setNumberState.bind(this);
  }



  componentDidMount() {
    console.log("OUTBOUND DIALPAD: Mounting DialPadLauncher");
    this.initSyncListener();
  }

  componentWillUnmount() {
    console.log("OUTBOUND DIALPAD: Unmounting DialPadLauncher");
  }

  initSyncListener() {

    const { openDialpad } = this.props;

    DialpadSyncDoc.getDialpadSyncDoc()
      .then(doc => {

        console.log("OUTBOUND DIALPAD: Initial Sync Doc State: ", doc.value);

        //forcing update incase state event callback has been made
        if (doc.value && doc.value.call && doc.value.call.callSid) {
          console.log("OUTBOUND DIALPAD: forcing update of sync doc for initial setup");
          DialpadSyncDoc.forceUpdateStatus(doc.value.call.callSid);
        }

        // map and respond to sync doc state upon load
        this.setState(doc.value)
        this.processCallStatus()

        //add listener and handler for doc changes
        doc.on("updated", updatedDoc => {
          console.log("OUTBOUND DIALPAD: Sync Doc Update Recieved: ", updatedDoc.value);
          this.setState(updatedDoc.value)
          if (updatedDoc.value.autoDial) {
            openDialpad();
          }
          this.processCallStatus();

        })

      })
  }

  processCallStatus() {
    const { call } = this.state;
    const { openDialpad, closeDialpad } = this.props;

    if (CallStatus.isRinging(call)) {
      console.log("OUTBOUND DIALPAD: Call Status Update Ringing State");
      // this ensures the dialpad is opened if the page is refreshed
      openDialpad();
      RingingService.startRinging();
    } else if (CallStatus.isAnswered(call)) {
      console.log("OUTBOUND DIALPAD: Call Status Update Answered State");
      // The agent will be pushed into available
      // by function handling the call status change
      // "in-progress" - this is just to reset the sync doc
      RingingService.stopRinging();
      closeDialpad();
    } else if (CallStatus.isTerminalState(call)) {
      console.log("OUTBOUND DIALPAD: Call Status Update Terminal State");
      // any termination state will reset the sync doc
      // and make sure the dialpad isnt ringing
      RingingService.stopRinging();
      DialpadSyncDoc.clearSyncDoc();

    }
  }

  // used to ensure dialpad popup can't be closed while making
  // an outbound call
  handleClose() {
    const { call } = this.state;
    const { closeDialpad } = this.props;

    if (CallStatus.isCloseable(call)) {
      closeDialpad();
    } else {
      Notifications.showNotification("CantCloseDialpad");
    }
  };

  // used to allow state updated from child component
  setCallState(callUpdate) {
    console.log("OUTBOUND DIALPAD: Call State updated from Dialpad Popup:", callUpdate.callStatus);

    this.setState({ call: callUpdate });
  };

  // used to allow state updated from child component
  setNumberState(numberUpdate) {
    console.log("OUTBOUND DIALPAD: Number State updated from Dialpad Popup");
    this.setState({ numberToDial: numberUpdate });
  };

  render() {
    const { classes, onClose, ...other } = this.props;

    return (
      <StyledDialog
        disableBackdropClick
        disableEscapeKeyDown
        onClose={this.handleClose}
        aria-labelledby="simple-dialog-title"
        maxWidth={"xs"}
        {...other}
      >
        <CloseButton>
          {""}
          <Close
            onClick={() => {
              this.handleClose();
            }}
          />
          {""}
        </CloseButton>
        <DialPad
          key="dialpadModal"
          call={this.state.call}
          number={this.state.numberToDial}
          autoDial={this.state.autoDial}
          setCallState={this.setCallState}
          setNumberState={this.setNumberState}
          closeViewFunction={this.handleClose}
        />
      </StyledDialog>
    );
  }
}

DialPadDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  openDialpad: PropTypes.func.isRequired,
  closeDialpad: PropTypes.func.isRequired,
};



const CloseButton = styled("div")`
  cursor: pointer;
  position: absolute;
  top: 10px;
  left: 5px;
  color: white;
`;

export default class DialPadLauncher extends React.Component {
  state = {
    isOpen: false
  };

  openDialpad = () => {
    this.setState({
      isOpen: true
    });
  };

  closeDialpad = () => {
    this.setState({ isOpen: false });
  };

  render() {
    return (
      <div>
        <SideLink
          {...this.props}
          icon="Call"
          iconActive="CallBold"
          isActive={this.props.activeView === "dialer"}
          onClick={() => this.openDialpad()}
        >
          Dialpad
        </SideLink>
        <DialPadDialog
          open={this.state.isOpen}
          openDialpad={this.openDialpad}
          closeDialpad={this.closeDialpad}
        />
      </div>
    );
  }
}
