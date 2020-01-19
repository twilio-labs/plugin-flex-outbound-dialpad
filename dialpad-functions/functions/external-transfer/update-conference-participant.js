const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('update-conference-participant parameters:');
  Object.keys(event).forEach(key => {
    if (key !== "token" || key !== "Token") {
      console.log(`${key}: ${event[key]}`);
    }
  });

  if (Object.keys(event).length === 0) {
    console.log('Empty event object, likely an OPTIONS request');
    return callback(null, response);
  }

  const {
    conference,
    participant,
    endConferenceOnExit
  } = event;

  console.log(`Updating participant ${participant} in conference ${conference}`);
  const client = context.getTwilioClient();
  const participantResponse = await client
    .conferences(conference)
    .participants(participant)
    .update({
      endConferenceOnExit
    }).catch(e => {
      console.error(e);
      return {};
    });
  console.log('Participant response properties:');
  Object.keys(participantResponse).forEach(key => {
    console.log(`${key}: ${participantResponse[key]}`);
  });

  response.setBody({
    status: 200
  });

  return callback(null, response);
});
