const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('remove-conference-participant parameters:');
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
    participant
  } = event;

  console.log(`Removing participant ${participant} from conference ${conference}`);
  const client = context.getTwilioClient();
  const participantResponse = await client
    .conferences(conference)
    .participants(participant)
    .remove();
  console.log('Participant response properties:');
  Object.keys(participantResponse).forEach(key => {
    console.log(`${key}: ${participantResponse[key]}`);
  });

  return callback(null, response);
});
