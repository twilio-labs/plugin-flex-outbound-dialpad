export function isTerminalState(state) {
	return (state === "completed" ||
		state === "canceled" ||
		state === "failed" ||
		state === "busy" ||
		state === "no-answer" ||
		state === "canceled" ||
		state === "") ? true : false
}