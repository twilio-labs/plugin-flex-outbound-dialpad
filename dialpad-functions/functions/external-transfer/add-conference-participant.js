const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('add-conference-participant parameters:');
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
    taskSid,
    to,
    from
  } = event;

  console.log(`Adding ${to} to named conference ${taskSid}`);
  const client = context.getTwilioClient();
  const participantsResponse = await client
    .conferences(taskSid)
    .participants
    .create({
      to,
      from,
      earlyMedia: true,
      endConferenceOnExit: false
    });
  console.log('Participant response properties:');
  Object.keys(participantsResponse).forEach(key => {
    console.log(`${key}: ${participantsResponse[key]}`);
  });
  response.setBody({
    ...participantsResponse,
    status: 200,
    _version: undefined
  });

  return callback(null, response);
});
