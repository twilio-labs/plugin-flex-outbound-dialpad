import React from "react";
import { Actions, Notifications } from "@twilio/flex-ui";
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

import { takeOutboundCall } from "../eventListeners/workerClient/reservationCreated";

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
    this.state = {
      websocketStatus: "closed",
      call: props.call,
      number: ""
    };
    this.webSocket = null;

    //audio credit https://freesound.org/people/AnthonyRamirez/sounds/455413/
    //creative commons license
    this.ringSound = new Audio(
      "https://freesound.org/data/previews/455/455413_7193358-lq.mp3"
    );
    this.ringSound.loop = true;
    this.ringSound.volume = 0.5;
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
                  classes.functionButton
                )}
                onClick={e => {
                  this.dial(this.state.number);
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

  sendHello() {
    if (this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send("Hello, i am connected");
    }
  }

  initWebSocket() {
    var backendHostname = "outbound-dialing-backend.herokuapp.com";

    this.webSocket = new WebSocket(
      "wss://" + backendHostname + "/outboundDialWebsocket2",
      null
    );

    this.webSocket.onerror = function() {
      console.error("Connection Error");
      Notifications.showNotification("WebsocketError", {
        url: backendHostname
      });
    };

    this.webSocket.onopen = function() {
      this.setState({ websocketStatus: "open" });
    }.bind(this);

    this.webSocket.onclose = function() {
      this.setState({ websocketStatus: "open" });
    }.bind(this);

    this.webSocket.onmessage = message => this.handleWebSocketMessage(message);
  }

  handleWebSocketMessage(message) {
    console.debug("Event recieved: ", message.data);

    try {
      var data = JSON.parse(message.data);
      if (data.callSid && data.callStatus) {
        this.props.setCallFunction(data);

        if (data.callStatus === "ringing") {
          this.ringSound.play();
        } else if (data.callStatus === "in-progress") {
          this.ringSound.pause();
          this.ringSound.currentTime = 0;
          takeOutboundCall();
          this.props.closeViewFunction();
        } else if (
          data.callStatus === "completed" ||
          data.callStatus === "canceled"
        ) {
          this.ringSound.pause();
          this.ringSound.currentTime = 0;
          //TODO add notification caller hungup
        }
      }
    } catch (error) {
      console.warn("Unrecognized payload: ", message.data);
    }
  }

  componentDidMount() {
    console.log("Mounting Dialpad");
    this.initWebSocket();

    document.addEventListener("keydown", this.eventkeydownListener, false);
    document.addEventListener("keyup", this.eventListener, false);
  }

  componentWillUnmount() {
    console.log("Unmounting Dialpad");
    this.webSocket.close();
    document.removeEventListener("keydown", this.eventkeydownListener, false);
    document.removeEventListener("keyup", this.eventListener, false);
    this.ringSound.pause();
    this.props.setCallFunction({ callSid: "", callStatus: "" });
  }

  dial(number) {
    if (
      this.state.websocketStatus === "open" &&
      this.state.number !== "" &&
      this.props.call.callStatus !== "dialing"
    ) {
      console.log("Calling: ", number);

      Actions.invokeAction("SetActivity", {
        activityName: "Busy"
      }).then(() => {
        if (!this.props.available) {
          this.webSocket.send(
            JSON.stringify({
              method: "call",
              to: number,
              from: "+12565769948",
              workerContactUri: this.props.workerContactUri
            })
          );
          this.props.setCallFunction({ callSid: "", callStatus: "dialing" });
        }
      });
    } else {
      console.log("Websocket not ready");
    }
  }

  hangup(callSid) {
    console.debug("Hanging up call: ", callSid);

    // only hangup if call is actually ringing
    // if hangup occurs while queued, twilio fails to handle future hang up requests
    if (this.props.call.callStatus === "ringing") {
      this.webSocket.send(
        JSON.stringify({
          method: "hangup",
          callSid: callSid
        })
      );

      // TODO: Make this more sophisticated form of activity state management
      Actions.invokeAction("SetActivity", {
        activityName: "Idle"
      });
    }
  }

  eventListener = e => this.keyPressListener(e);
  eventkeydownListener = e => this.keydownListener(e);

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
        this.dial(this.state.number);
      }
    }
  }

  backspaceAll() {
    this.setState({ number: "" });
  }

  backspace() {
    this.setState({
      number: this.state.number.substring(0, this.state.number.length - 1)
    });
  }
  buttonPress(value) {
    const activeCall = this.props.activeCall;

    if (activeCall === "") {
      if (this.state.number.length < 13) {
        this.setState({ number: this.state.number + value });
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
              <div className={classes.headerInput}>{this.state.number}</div>
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
    workerContactUri: state.flex.worker.attributes.contact_uri,
    activeCall:
      typeof state.flex.phone.connection === "undefined"
        ? ""
        : state.flex.phone.connection.source,
    available: state.flex.worker.activity.available
  };
};

export default connect(mapStateToProps)(withStyles(styles)(DialPad));
