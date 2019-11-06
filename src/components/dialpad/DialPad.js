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

import { FUNCTIONS_HOSTNAME, DEFAULT_FROM_NUMBER, SYNC_CLIENT } from "../../OutboundDialingWithConferencePlugin"

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
    const { classes } = this.props;

    return (
      <div className={classes.numpadRowContainer} style={{ marginBottom: 0 }}>
        {this.props.call.callStatus !== "queued" &&
          this.props.call.callStatus !== "ringing" &&
          this.props.activeCall === "" ? (
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
                    this.dial(this.props.number);
                  }}
                >
                  <Phone />
                </Button>
              </MuiThemeProvider>
            </div>
          ) : (
            <div />
          )}
        {this.props.call.callStatus === "queued" ||
          this.props.call.callStatus === "ringing" ? (
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
                  onClick={e => this.hangup(this.props.call.callSid)}
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
    console.log("Mounting Dialpad");
    document.addEventListener("keydown", this.eventkeydownListener, false);
    document.addEventListener("keyup", this.eventListener, false);
    document.addEventListener("paste", this.pasteListener, false);

    console.log("PROPS: ", this.props);
    if (this.props.autoDial) {
      this.dial();
    }
  }

  componentWillUnmount() {
    console.log("Unmounting Dialpad");

    document.removeEventListener("keydown", this.eventkeydownListener, false);
    document.removeEventListener("keyup", this.eventListener, false);
    document.removeEventListener("paste", this.pasteListener, false);
  }

  setAgentUnavailable() {
    return new Promise((resolve, reject) => {

      Actions.invokeAction("SetActivity", {
        activityName: "Busy"
      })
        .then(() => {
          resolve();
        })
        .catch(error => {
          Actions.invokeAction("SetActivity", {
            activityName: "Offline"
          })
            .then(() => {
              resolve();
            })
            .catch(() => {
              Notifications.showNotification("ActivityStateUnavailable", {
                state1: "Busy",
                state2: "Offline"
              });
              reject();
            });
        });
    })
  }

  checkNoVoiceTasksOpen() {
    const { tasks } = this.props;

    var response = true;
    tasks.forEach(value => {
      console.log(value);
      if (value.channelType === "voice") {
        response = false;
      }
    })

    return response;
  };

  dial() {
    console.log("ATTEMPTING TO DIAL");
    console.log("Number: ", this.props.number);
    console.log("callStatus: ", this.props.call.callStatus);
    if (
      this.checkNoVoiceTasksOpen() &&
      this.props.number !== "" &&
      (!this.props.call || this.props.call.callStatus === "" || this.props.call.callStatus === "completed" || this.props.call.callStatus === "canceled") &&
      this.props.activeCall === ""
    ) {
      this.setAgentUnavailable()
        .then(() => this.orchestrateMakeCall())
        .catch();
    } else {
      Notifications.showNotification("CantDialOut");
    }
  }

  orchestrateMakeCall() {
    if (!this.props.available) {
      this.props.setCallFunction({ callSid: "", callStatus: "dialing" })
      this.makeDialFunctionCall(this.props.number)
        .then(response => {
          if (response.error) {
            this.props.setCallFunction({ callSid: "", callStatus: "" });
            Notifications.showNotification("BackendError", {
              message: response.error.message
            });
          }
        })
        .catch(error => {
          this.props.setCallFunction({ callSid: "", callStatus: "" })
          Notifications.showNotification("BackendError", {
            message: error.error.message
          });
        })
    }
  }

  makeDialFunctionCall(to) {

    const from = this.props.phoneNumber ? this.props.phoneNumber : DEFAULT_FROM_NUMBER;

    const makeCallURL = `https://${FUNCTIONS_HOSTNAME}/outbound-dialing/makeCall`
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    const body = (
      `token=${encodeURIComponent(this.token)}`
      + `&To=${encodeURIComponent(to)}`
      + `&From=${encodeURIComponent(from)}`
      + `&workerContactUri=${encodeURIComponent(this.props.workerContactUri)}`
      + `&functionsDomain=${encodeURIComponent(FUNCTIONS_HOSTNAME)}`
    )

    return new Promise((resolve, reject) => {

      fetch(makeCallURL, {
        headers,
        method: 'POST',
        body
      })
        .then(response => response.json())
        .then(json => {
          resolve(json);
        })
        .catch(x => {
          x = (x == "TypeError: Failed to fetch") ? "Backend not available" : x
          resolve({ error: { message: x } })
        })

    })
  }

  hangup(callSid) {
    // if hangup occurs while queued, twilio fails and fails
    // to handle future hang up requests
    if (this.props.call.callStatus !== "queued") {

      this.makeHangupFunctionCall(callSid)
        .then(response => {
          if (response.error) {
            Notifications.showNotification("BackendError", {
              message: response.error.message
            });
          }
          if (response.call && (response.call.status === "completed" || response.call.status === "cancelled")) {
            // in case of emergency, if hangup operation is successfull
            // this ensures sync map is updated to allow for more calls
            SYNC_CLIENT
              .document(this.syncDocName)
              .then(doc => {
                doc.update({ call: { callSid: "", callStatus: "completed" } });
              })
            this.ringSound.pause();
          }
        })
        .catch(error => {
          Notifications.showNotification("BackendError", {
            message: error
          });
        })
    }
  }

  makeHangupFunctionCall = (CallSid) => {

    const endCallURL = `https://${FUNCTIONS_HOSTNAME}/outbound-dialing/endCall`
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    const body = (
      `token=${this.token}`
      + `&CallSid=${CallSid}`
    )

    return new Promise((resolve, reject) => {

      fetch(endCallURL, {
        headers,
        method: 'POST',
        body
      })
        .then(response => response.json())
        .then(json => {
          resolve(json);
        })
        .catch(x => {
          x = (x == "TypeError: Failed to fetch") ? "Backend not available" : x
          resolve({ error: { message: x } })
        })
    })
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
    var callStatus = this.props.call.callStatus;
    e.preventDefault();
    e.stopPropagation();
    if ((e.keyCode > 47 && e.keyCode < 58) || e.keyCode === 187) {
      //listen to 0-9 & +
      this.buttonPress(e.key);
    } else if (e.keyCode === 13) {
      //listen for enter
      if (callStatus === "ringing" || callStatus === "in-progress") {
        this.hangup(this.props.call.callSid);
      } else if (
        callStatus === "" ||
        callStatus === "completed" ||
        callStatus === "canceled"
      ) {
        this.dial();
      }
    }
  }

  backspaceAll() {
    this.props.setNumberFunction("");
  }

  backspace() {
    this.props.setNumberFunction(this.props.number.substring(0, this.props.number.length - 1));
  }
  buttonPress(value) {
    const activeCall = this.props.activeCall;

    if (activeCall === "") {
      if (this.props.number.length < 13) {
        this.props.setNumberFunction(this.props.number + value);
      }
    } else {
      console.debug("activeCall", activeCall);
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
