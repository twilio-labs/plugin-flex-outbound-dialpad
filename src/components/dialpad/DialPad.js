import React from "react";
import { Actions, Manager, Notifications } from "@twilio/flex-ui";
import {
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core/styles";
import Phone from "@material-ui/icons/Phone";
import CallEnd from "@material-ui/icons/CallEnd";
import ClickNHold from "react-click-n-hold";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Backspace from "@material-ui/icons/Backspace";

import classNames from "classnames";
import { connect } from "react-redux";


import { blockForOutboundCall, unblockForOutBoundCall } from "../../eventListeners/workerClient/reservationCreated";
import { CallControls, CallStatus, RingingService, DialpadSyncDoc } from '../../utilities/DialPadUtil'



const styles = theme => ({
  main: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  dialpad: {
    width: "100%",
    maxHeight: "700px",
    maxWidth: "400px",
    backgroundColor: theme.SideNav.Container.background
  },
  headerInputContainer: {
    display: "flex",
    justifyContent: "stretch",
    alignItems: "center",
    marginBottom: "25px",
    marginLeft: "30px"
  },
  headerInput: {
    minHeight: "40px",
    maxHeight: "40px",
    borderBottom: "2px solid white",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius,
    fontSize: "1.5em",
    padding: theme.spacing.unit,
    flexGrow: 1,
    marginRight: "5px",
    color: "white"
  },
  backspaceButton: {
    cursor: "pointer",
    color: theme.palette.grey[100],
    "&:hover": {
      opacity: ".4"
    }
  },
  numpadContainer: {
    margin: theme.spacing.unit
  },
  numpadRowContainer: {
    display: "flex",
    marginBottom: "15px",
    justifyContent: "center"
  },
  numberButtonContainer: {
    width: "33%"
  },
  numberButton: {
    display: "block",
    margin: theme.spacing.unit,
    width: "60px",
    height: "60px",
    borderRadius: "100%",
    paddingBottom: "20%",
    fontSize: "1.2em",
    fontWeight: "700",
    textAlign: "center"
  },
  functionButton: {
    paddingBottom: "0%"
  },
  hide: {
    visibility: "hidden"
  }
});

const greenButton = createMuiTheme({
  palette: {
    primary: green
  },
  typography: {
    useNextVariants: true
  }
});

const redButton = createMuiTheme({
  palette: {
    primary: red
  },
  typography: {
    useNextVariants: true
  }
});

export class DialPad extends React.Component {
  constructor(props) {
    super(props);

    this.token = Manager.getInstance().user.token;
    this.syncDocName = `${this.props.workerContactUri}.outbound-call`;
  }

  buttons = [
    [
      {
        value: "1",
        letters: ""
      },
      {
        value: "2",
        letters: "abc"
      },
      {
        value: "3",
        letters: "def"
      }
    ],
    [
      {
        value: "4",
        letters: "ghi"
      },
      {
        value: "5",
        letters: "jkl"
      },
      {
        value: "6",
        letters: "mno"
      }
    ],
    [
      {
        value: "7",
        letters: "pqrs"
      },
      {
        value: "8",
        letters: "tuv"
      },
      {
        value: "9",
        letters: "wxyz"
      }
    ],
    [
      {
        value: "*",
        letters: " "
      },
      {
        value: "0",
        letters: "+"
      },
      {
        value: "#",
        letters: " "
      }
    ]
  ];

  numpad = this.buttons.map((rowItem, rowIndex) => {
    const { classes } = this.props;

    return (
      <div className={classes.numpadRowContainer} key={rowIndex}>
        {rowItem.map((item, itemIndex) => {
          return (
            <div className={classes.numberButtonContainer}>
              {item.value !== "0"
                ? this.standardNumberButton(item)
                : this.clickNHoldButton(item)}
            </div>
          );
        })}
      </div>
    );
  });

  standardNumberButton(item) {
    const { classes } = this.props;
    return (
      <Button
        variant="contained"
        aria-label={item.value}
        key={item.value}
        className={classNames(classes.numberButton)}
        onClick={e => this.buttonPress(item.value)}
      >
        {item.value}
        {item.letters && (
          <div
            style={{
              fontSize: "50%",
              fontWeight: "300"
            }}
          >
            {item.letters}
          </div>
        )}
      </Button>
    );
  }

  clickNHoldButton(item) {
    const { classes } = this.props;
    return (
      <ClickNHold
        time={0.8}
        onClickNHold={e => this.buttonPlusPress(e, item)}
        onEnd={(e, threshold) => this.buttonZeroPress(e, threshold, item)}
      >
        <Button
          variant="contained"
          aria-label={item}
          key={item}
          className={classNames(classes.numberButton)}
        >
          {item.value}
          {item.letters && (
            <div
              style={{
                fontSize: "50%",
                fontWeight: "300"
              }}
            >
              {item.letters}
            </div>
          )}
        </Button>
      </ClickNHold>
    );
  }

  functionButtons() {
    const { classes, call, activeCall } = this.props;

    return (
      <div className={classes.numpadRowContainer} style={{ marginBottom: 0 }}>
        {CallStatus.showGreenButton(call, activeCall) ? (
          <div className={classes.numberButtonContainer}>
            <MuiThemeProvider theme={greenButton}>
              <Button
                variant="contained"
                style={{ color: "white" }}
                color="primary"
                className={classNames(
                  classes.numberButton,
                  classes.functionButton,
                  this.props.call.callStatus === "dialing" ? classes.hide : ""
                )}
                onClick={e => {
                  this.pressDial(this.props.number);
                }}
              >
                <Phone />
              </Button>
            </MuiThemeProvider>
          </div>
        ) : (
            <div />
          )}
        {CallStatus.showRedButton(call) ? (
          <div className={classes.numberButtonContainer}>
            <MuiThemeProvider theme={redButton}>
              <Button
                variant="contained"
                style={{ color: "white" }}
                color="primary"
                className={classNames(
                  classes.numberButton,
                  classes.functionButton,
                  this.props.call.callStatus === "queued" ? classes.hide : ""
                )}
                onClick={e => this.pressHangup(this.props.call.callSid)}
              >
                <CallEnd />
              </Button>
            </MuiThemeProvider>
          </div>
        ) : (
            <div />
          )}
      </div>
    );
  }

  componentDidMount() {
    console.log("OUTBOUND DIALPAD: Mounting Dialpad Popup");

    this.initialActivity = Manager.getInstance().workerClient.activity.name;
    console.log("OUTBOUND DIALPAD: Initial activity when dialpad launched", this.initialActivity);

    document.addEventListener("keydown", this.eventkeydownListener, false);
    document.addEventListener("keyup", this.eventListener, false);
    document.addEventListener("paste", this.pasteListener, false);

    blockForOutboundCall();
    this.setAgentUnavailable();


    // As this is only checked when the dialpad is mounted
    // auto dial only works when the dialpad is closed
    if (this.props.autoDial) {
      console.log("OUTBOUND DIALPAD: Auto Dial triggered");
      this.pressDial();
    }
  }

  componentWillUnmount() {
    const { call } = this.props;

    console.log("OUTBOUND DIALPAD: Unmounting Dialpad Popup");


    DialpadSyncDoc.clearSyncDoc();
    document.removeEventListener("keydown", this.eventkeydownListener, false);
    document.removeEventListener("keyup", this.eventListener, false);
    document.removeEventListener("paste", this.pasteListener, false);

    // We only want to return to the agents activity when unmounting
    // if the call back status handler hasnt already done it for us.
    // We do it in the callback status handler to expedite this transition
    // and ultimately expedite the acceptance of the call
    // Also when a call is in progress, we want the reservation created handler
    // to be responsible for unblocking inbounce voice tasks.  This is because
    // it is possible that the dialpad could close before the reservation comes
    // through, this would mean a voice call could come in.
    if (call.callStatus !== "in-progress") {
      console.log("OUTBOUND DIALPAD: Returning to initial activity when dialpad launched", this.initialActivity);
      unblockForOutBoundCall();
      Actions.invokeAction("SetActivity", {
        activityName: this.initialActivity
      })
    }


  }

  setAgentUnavailable() {
    return new Promise((resolve, reject) => {

      Actions.invokeAction("SetActivity", {
        activityName: "Outbound Calls"
      })
        .then(() => {
          console.log("OUTBOUND DIALPAD: Agent is now Busy");
          resolve();
        })
        .catch(error => {
          Actions.invokeAction("SetActivity", {
            activityName: "Offline"
          })
            .then(() => {
              console.log("OUTBOUND DIALPAD: Agent is now Offline");
              resolve();
            })
            .catch(() => {
              Notifications.showNotification("ActivityStateUnavailable", {
                state1: "Outbound Calls",
                state2: "Offline"
              });
              reject();
            });
        });
    })
  }

  noVoiceTasksOpen() {
    const { tasks } = this.props;

    var response = true;
    tasks.forEach(value => {
      if (value.channelType === "voice") {
        console.warn("OUTBOUND DIALPAD: Voice task is still open, probably in wrap up, canceling dial");
        response = false;
      }
    })

    return response;
  };

  pressDial() {
    console.log("OUTBOUND DIALPAD: Dial Button Pressed");

    const { call } = this.props;

    if (
      this.noVoiceTasksOpen() &&
      this.props.number !== "" &&
      CallStatus.canDial(call) &&
      this.props.activeCall === ""
    ) {
      this.orchestrateMakeCall()

    } else {
      Notifications.showNotification("CantDialOut");
    }
  }

  orchestrateMakeCall() {
    console.log("OUTBOUND DIALPAD: Orhcestrating call");

    const { setCallState } = this.props;

    // setup an interim callStatus of dialing, while we make the backend call
    // this will block any other calls being made
    setCallState({ callSid: "", callStatus: "dialing" })

    CallControls.makeCall(this.props.number)
      .then(response => {

        if (response.error) {
          const { message } = response.error
          console.error("OUTBOUND DIALPAD: failure placing call", message);

          Notifications.showNotification("BackendError", {
            message: message
          });

          // reset the "dialing" status the blocked further calls
          setCallState({ callSid: "", callStatus: "" })
        } else {
          console.log("OUTBOUND DIALPAD: call succesfully placed");
        }
      })
      .catch(error => {
        console.error("OUTBOUND DIALPAD: failure placing call", error);
        Notifications.showNotification("BackendError", {
          message: error.error.message
        });

        // reset the "dialing" status the blocked further calls
        setCallState({ callSid: "", callStatus: "" })
      })

  }


  pressHangup(callSid) {
    // if hangup occurs while queued, twilio fails and also fails
    // to handle future hang up requests
    if (this.props.call.callStatus !== "queued") {

      CallControls.hangupCall(callSid)
        .then(response => {
          const { call, error } = response;
          if (error) {
            console.error("OUTBOUND DIALPAD: Issue when hanging up call, ", response.error.message);
            Notifications.showNotification("BackendError", {
              message: response.error.message
            });
          }
          if (CallStatus.isTerminalState(call)) {
            DialpadSyncDoc.clearSyncDoc();
            RingingService.stopRinging();
          }
        })
        .catch(error => {
          console.error("OUTBOUND DIALPAD: Unknown issue calling hangup, ", error);
          Notifications.showNotification("BackendError", {
            message: error
          });
        })
    }
  }

  eventListener = e => this.keyPressListener(e);

  eventkeydownListener = e => this.keydownListener(e);

  pasteListener = e => {
    const paste = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, ""); //strip all non numeric characters from paste
    for (var i = 0; i < paste.length; i++) {
      this.buttonPress(paste.charAt(i));
    }
  };

  keydownListener(e) {
    if (e.keyCode === 8) {
      e.preventDefault();
      e.stopPropagation();
      this.backspace();
    }
  }

  keyPressListener(e) {
    const { call } = this.props
    e.preventDefault();
    e.stopPropagation();
    if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 187 || e.keyCode === 107) {
      //listen to 0-9 & +
      this.buttonPress(e.key);
    } else if (e.keyCode === 13) {
      //listen for enter
      if (CallStatus.isRinging(call)) {
        this.pressHangup(this.props.call.callSid);
      } else if (
        call.callStatus === "" ||
        CallStatus.isTerminalState(call)
      ) {
        this.pressDial();
      }
    }
  }

  backspaceAll() {
    this.props.setNumberState("");
  }

  backspace() {
    this.props.setNumberState(this.props.number.substring(0, this.props.number.length - 1));
  }

  buttonPress(value) {
    const activeCall = this.props.activeCall;

    if (activeCall === "") {
      if (this.props.number.length < 13) {
        this.props.setNumberState(this.props.number + value);
      }
    } else {
      activeCall.sendDigits(value);
    }
  }

  buttonPlusPress(e, item) {
    this.buttonPress(item.letters);
  }

  buttonZeroPress(e, threshold, item) {
    e.preventDefault();
    e.stopPropagation();
    if (!threshold) {
      this.buttonPress(item.value);
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.main}>
        <Card className={classes.dialpad}>
          <CardContent>
            <div className={classes.headerInputContainer}>
              <div className={classes.headerInput}>{this.props.number}</div>
              <ClickNHold
                time={0.5}
                onStart={this.backspace.bind(this)}
                onClickNHold={this.backspaceAll.bind(this)}
              >
                <Backspace className={classes.backspaceButton} />
              </ClickNHold>
            </div>
            <div className={classes.numpadContainer}>
              {this.numpad.map(button => button)}
              {this.functionButtons()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    tasks: state.flex.worker.tasks,
    phoneNumber: state.flex.worker.attributes.phone,
    workerContactUri: state.flex.worker.attributes.contact_uri,
    activeCall:
      typeof state.flex.phone.connection === "undefined"
        ? ""
        : state.flex.phone.connection.source,
    available: state.flex.worker.activity.available
  };
};

export default connect(mapStateToProps)(withStyles(styles)(DialPad));
