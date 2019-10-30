/*
 Function for recieving call status updates and pushing them into
 a sync document monitored by the worker.  This allows the front end
 to recognize when the call is queued, ringing, answered and for
 the front end to recieve the task
 */
exports.handler = async function (context, event, callback) {

  console.debug("callback for: ", event.CallSid);
  console.debug("\tto:\t", event.To);
  console.debug("\tfrom:\t", event.From);
  console.debug("\tstatus:\t", event.CallStatus);
  console.debug("\tworkerSyncDoc:\t", event.workerSyncDoc);

  const response = new Twilio.Response();

  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  const client = context.getTwilioClient();
  const syncService = client.sync.services(context.TWILIO_SYNC_SERVICE_SID);

  syncService.documents(event.workerSyncDoc)
    .update({
      data: {
        callSid: event.CallSid,
        callStatus: event.CallStatus
      }
    })

  callback(null, response);


};


