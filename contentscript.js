// qs-supporttools
chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if (message.method === "answerChat") {
			document.getElementsByClassName("meshim_dashboard_components_chatBar_ServeRequestButton incoming_button")[0].click();
		} else if (message.method === "getText") {
			sendResponse({data: document.documentElement.innerText, method:"getText"});
		}
	});