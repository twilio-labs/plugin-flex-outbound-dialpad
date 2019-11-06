import * as React from "react";

import { SideLink, Manager } from "@twilio/flex-ui";
import Dialog from "@material-ui/core/Dialog";
import PropTypes from "prop-types";
import DialPad from "./DialPad";
import Close from "@material-ui/icons/Close";
import styled from "react-emotion";
import { withStyles } from "@material-ui/core/styles";
import { takeOutboundCall } from "../../eventListeners/workerClient/reservationCreated";
import { SYNC_CLIENT } from "../../OutboundDialingWithConferencePlugin"

const StyledDialog = withStyles({
  root: {
    width: "100%"
  }
})(({ classes, ...other }) => <Dialog className={classes.root} {...other} />);

class DialPadDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      remoteOpen: false,
      numberToDial: "",
      call: { callSid: "", callStatus: "" }
    };

    this.syncDocName = `${Manager.getInstance().workerClient.attributes.contact_uri}.outbound-call`;

    //audio credit https://freesound.org/people/AnthonyRamirez/sounds/455413/
    //creative commons license
    this.ringSound = new Audio(
      "https://freesound.org/data/previews/455/455413_7193358-lq.mp3"
    );
    this.ringSound.loop = true;
    this.ringSound.volume = 0.5;

    this.setState = this.setState.bind(this);
  }

  handleCallStatusChange() {
    if (this.state.call.callStatus === "ringing") {
      this.props.forceOpen();
      this.ringSound.play();
    } else if (this.state.call.callStatus === "in-progress") {
      this.ringSound.pause();
      this.ringSound.currentTime = 0;

      SYNC_CLIENT
        .document(this.syncDocName)
        .then(doc => {
          doc.update({
            call: { callSid: "", callStatus: "" },
            numberToDial: "",
            remoteOpen: false
          });
        })
      takeOutboundCall();
      this.handleClose();
    } else if (
      this.state.call.callStatus === "completed" ||
      this.state.call.callStatus === "canceled"
    ) {
      this.ringSound.pause();
      this.ringSound.currentTime = 0;
    }
  }

  componentDidMount() {
    console.log("Mounting DialPadLauncher");
    this.initSyncListener();
  }

  componentWillUnmount() {
    console.log("Unmounting DialPadLauncher");
  }

  initSyncListener() {
    // init sync doc on component mount
    SYNC_CLIENT
      .document(this.syncDocName)
      .then(doc => {
        this.setState(doc.value)
        this.handleCallStatusChange()
        doc.on("updated", updatedDoc => {
          this.setState(updatedDoc.value)
          if (updatedDoc.value.remoteOpen) {
            this.props.forceOpen();
          }
          this.handleCallStatusChange()
        })
      })
  }

  handleClose = () => {
    const { call } = this.state;
    if (
      call.callStatus !== "dialing" &&
      call.callStatus !== "queued" &&
      call.callStatus !== "ringing"
    ) {
      this.props.onClose();
    }
  };

  setCall = callUpdate => {
    this.setState({ call: callUpdate });
  };

  setNumber = numberUpdate => {
    this.setState({ numberToDial: numberUpdate });
  };

  render() {
    const { classes, onClose, ...other } = this.props;
    //window.onbeforeunload = function () { return false; }

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
          autoDial={this.state.remoteOpen}
          setCallFunction={this.setCall}
          setNumberFunction={this.setNumber}
          closeViewFunction={this.handleClose}
        />
      </StyledDialog>
    );
  }
}

DialPadDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  backendHostname: PropTypes.string.isRequired
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
    open: false
  };

  handleClickOpen = () => {
    this.setState({
      open: true
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <SideLink
          {...this.props}
          icon="Call"
          iconActive="CallBold"
          isActive={this.props.activeView === "dialer"}
          onClick={() => this.handleClickOpen()}
        >
          Dialpad
        </SideLink>
        <DialPadDialog
          open={this.state.open}
          forceOpen={this.handleClickOpen}
          onClose={this.handleClose}
        />
      </div>
    );
  }
}
