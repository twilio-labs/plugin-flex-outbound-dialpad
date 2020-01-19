const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('hold-conference-participant parameters:');
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
    hold
  } = event;

  console.log(`${hold ? 'Holding' : 'Unholding'} participant ${participant} `
    + `in conference ${conference}`);
  const client = context.getTwilioClient();
  const participantsResponse = await client.conferences(conference)
    .participants(participant)
    .update({
      hold,
    });


  response.setBody({
    ...participantsResponse,
    status: 200,
    _version: undefined
  });

  console.log(`Participant ${participant} updated in conference \
  ${conference}. Participant response properties:`);

  Object.keys(response.body).forEach(key => {
    console.log(`  ${key}:`, response.body[key]);
  });

  return callback(null, response);
});
