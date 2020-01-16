const nodeFetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('get-call-properties parameters:');
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
    callSid,
  } = event;

  console.log(`Getting properties for call SID ${callSid}`);
  const client = context.getTwilioClient();
  const callProperties = await client
    .calls(callSid)
    .fetch();
  console.log('Call properties:');
  Object.keys(callProperties).forEach(key => {
    console.log(`${key}: ${callProperties[key]}`);
  });

  response.setBody({
    ...callProperties,
    _version: undefined
  });

  return callback(null, response);
});
