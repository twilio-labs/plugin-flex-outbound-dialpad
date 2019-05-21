# plugin-flex-outbound-dialpad

This plugin is intended to demonstrate how to make outbound calls from twilio flex without having to do any custom work around call conferencing and monitoring.

This plugin uses a custom built backend system to facilitate creation of outbound calls using Twilio Programmable Voice. These calls are enqueued straight back to the agent that made the call.  The backend system exposes a websocket to notify the front end client of changes to the call.  This enables automated state management in the front end to ensure there is no competing with other tasks.  As the calls are enqueued using Twiml, flex can accept the task reservation using reservation.conference() and the call from there is treated like any other call.  Transfers and supervisor monitoring are enabled.

The backend system is available [here](https://github.com/jhunter-twilio/outbound-dialing-backend) and can rapidly be deployed to heroku using the link provided 



# screenshot
![alt text](https://raw.githubusercontent.com/jhunter-twilio/plugin-flex-outbound-dialpad/master/screenshot/dialpad.png)

# use

1. Create backend system by either 
    - deploying to heroku [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jhunter-twilio/outbound-dialing-backend/tree/master)
    - cloning backend [repository](https://github.com/jhunter-twilio/outbound-dialing-backend) following the setup instructions and expose system with ngrok
2. Create a clone of this repository and update the line referencing the [backend](https://github.com/jhunter-twilio/plugin-flex-outbound-dialpad/blob/36c0bf8196496ec0adfa22dcac78746cc8f7fdf3/src/components/DialPad.js#L313)
3. run npm install
4. run npm start

# in case you missed it
When setting up the backend in heroku or local, you must ensure you have setup a dedicated task router worfklow for outbound calls and set the workflow sid in the environment configuration.  

- ensure there is the following matching workers expression for the only filter on the workspace 
  - task.targetWorker==worker.contact_uri
- make sure the filter matches to a queue with Everyone on it.  The default Everyone queue will work but if you want to seperate real time reporting for outbound calls, you'll want to make a dedicated queue for it with a queue expression
  - 1==1


# change log
v1.0 - initial release

# TODOs
1. improve styling to better match base palette
2. enhance state management so dialing and hanging up puts you back to starting state and not just "available"
3. Add alert if websocket connection is unable to connect or gets terminated unexpectedly
4. link dialpad into active call to send DTMF tones
