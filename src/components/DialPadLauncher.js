import * as React from "react";

import { SideLink } from "@twilio/flex-ui";
import Dialog from "@material-ui/core/Dialog";
import PropTypes from "prop-types";
import DialPad from "./DialPad";
import Close from "@material-ui/icons/Close";
import styled from "react-emotion";
import { withStyles } from "@material-ui/core/styles";

const StyledDialog = withStyles({
  root: {
    width: "100%"
  }
})(({ classes, ...other }) => <Dialog className={classes.root} {...other} />);

class DialPagDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      call: { callSid: "", callStatus: "" }
    };

    this.setState = this.setState.bind(this);
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
    console.log("call state set: ", callUpdate);
  };

  render() {
    const { classes, onClose, selectedValue, ...other } = this.props;

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
          setCallFunction={this.setCall}
          closeViewFunction={this.handleClose}
        />
      </StyledDialog>
    );
  }
}

DialPagDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  selectedValue: PropTypes.string
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
        <DialPagDialog
          selectedValue={this.state.selectedValue}
          open={this.state.open}
          onClose={this.handleClose}
        />
      </div>
    );
  }
}
