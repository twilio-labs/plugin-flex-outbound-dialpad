import { Manager } from "@twilio/flex-ui";
import {
	FUNCTIONS_HOSTNAME,
	DEFAULT_FROM_NUMBER,
	SYNC_CLIENT
} from "../OutboundDialingWithConferencePlugin"



class CallControlsClass {

	makeCall(to) {

		const manager = Manager.getInstance();
		const workerPhoneNumber = manager.workerClient.attributes.phone;
		const workerContactUri = manager.workerClient.attributes.contact_uri;
		const workerSid = manager.workerClient.sid;
		const token = manager.user.token;

		const from = workerPhoneNumber ? workerPhoneNumber : DEFAULT_FROM_NUMBER;

		const makeCallURL = `https://${FUNCTIONS_HOSTNAME}/outbound-dialing/makeCall`
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
		const body = (
			`token=${encodeURIComponent(token)}`
			+ `&To=${encodeURIComponent(to)}`
			+ `&From=${encodeURIComponent(from)}`
			+ `&workerContactUri=${encodeURIComponent(workerContactUri)}`
			+ `&functionsDomain=${encodeURIComponent(FUNCTIONS_HOSTNAME)}`
			+ `&workerSid=${encodeURIComponent(workerSid)}`
		)

		console.log("OUTBOUND DIALPAD: Making remote request to dial: ", to);

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

	hangupCall(CallSid) {

		const manager = Manager.getInstance();
		const token = manager.user.token;

		const endCallURL = `https://${FUNCTIONS_HOSTNAME}/outbound-dialing/endCall`
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
		const body = (
			`token=${token}`
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

}


class CallStatusClass {

	isTerminalState(call) {
		return (call && (call.callStatus === "completed" ||
			call.callStatus === "canceled" ||
			call.callStatus === "failed" ||
			call.callStatus === "busy" ||
			call.callStatus === "no-answer")) ? true : false
	}

	// canDial includes an empty callStatus and is distinct with isTermanlState
	// isTerminalState is used to determine if syncDoc should be updated
	// it needs to exclude the end state or it will peruputally update itself
	canDial(call) {
		return (call && (call.callStatus === "completed" ||
			call.callStatus === "canceled" ||
			call.callStatus === "failed" ||
			call.callStatus === "busy" ||
			call.callStatus === "no-answer" ||
			call.callStatus === "")) ? true : false
	}

	isRinging(call) {
		return (call && call.callStatus === "ringing") ? true : false
	}

	isAnswered(call) {
		return (call && call.callStatus === "in-progress") ? true : false
	}

	// You cant close the dialpad after a call is started and before
	// the call is answered or terminated
	isCloseable(call) {
		return (!call || (call.callStatus !== "dialing" &&
			call.callStatus !== "queued" &&
			call.callStatus !== "ringing")) ? true : false
	}

	showGreenButton(call, activeCall) {
		return (!call || (call.callStatus !== "queued" &&
			call.callStatus !== "ringing" && activeCall === "")) ? true : false
	}

	showRedButton(call) {
		return (call && (call.callStatus === "queued" || call.callStatus === "ringing")) ? true : false
	}

}

class RingingServiceClass {

	constructor() {
		//audio credit https://freesound.org/people/AnthonyRamirez/sounds/455413/
		//creative commons license
		this.ringSound = new Audio(
			"https://freesound.org/data/previews/455/455413_7193358-lq.mp3"
		);
		this.ringSound.loop = true;
		this.ringSound.volume = 0.5;
		this.ringSound.pause();
	}

	startRinging() {
		this.ringSound.play();
	}

	stopRinging() {
		this.ringSound.pause();
		this.ringSound.currentTime = 0;
	}
}

class DialpadSyncDocClass {

	constructor() {
		const manager = Manager.getInstance();
		const workerContactUri = manager.workerClient.attributes.contact_uri;
		this.syncDocName = `${workerContactUri}.outbound-call`;
	}

	getDialpadSyncDoc() {
		const syncDocName = this.syncDocName;
		return new Promise(function (resolve) {
			SYNC_CLIENT
				.document(syncDocName)
				.then(doc => {
					resolve(doc)
				})
		})
	}

	clearSyncDoc() {
		SYNC_CLIENT
			.document(this.syncDocName)
			.then(doc => {
				doc.update({
					call: { callSid: "", callStatus: "" },
					numberToDial: "",
					autoDial: false
				});
			})
	}

	removeAutoDial() {
		SYNC_CLIENT
			.document(this.syncDocName)
			.then(doc => {
				doc.update({ "autoDial": false });
			})
	}
}

export const CallStatus = new CallStatusClass();
export const RingingService = new RingingServiceClass();
export const DialpadSyncDoc = new DialpadSyncDocClass();
export const CallControls = new CallControlsClass()
