const nodeFetch = require('node-fetch');


exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('Event properties:');
  Object.keys(event).forEach(key => {
    console.log(`${key}: ${event[key]}`);
  });

  if (Object.keys(event).length === 0) {
    console.log('Empty event object, likely an OPTIONS request');
    return callback(null, response);
  }

  const {
    token,
    callSid,
  } = event;

  console.log('Validating request token');
  const tokenResponse = await getAuthentication(event.token, context);

  if (!tokenResponse.valid) {
    response.setStatusCode(401);
    response.setBody({
      status: 401,
      message: 'Your authentication token failed validation',
      detail: tokenResponse.message
    });
    return callback(null, response);
  }

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
};
