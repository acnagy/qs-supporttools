// qs-supporttools
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.method === "answerChat") {
		$( ".meshim_dashboard_components_chatBar_ServeRequestButton" ).click();
	} else if (message.method === "getText") {
		sendResponse({data: document.documentElement.innerText, method:"getText"});
	} else if (message.method === "copyTicketNumber") {
        sendResponse({ticketNumber: getTicketNumber()});
	}
});

function getTicketNumber() {
    ticket = ticketFromUrl();
    if (ticket === "") ticket = ticketFromNotice();
    if (ticket === "") ticket = ticketFromHighlighted();
    if (ticket === "") ticket = ticketFromHighlightedFrame();
    return ticket !== "" ? "#" + ticket : "No ticket selected."
    
}

function ticketFromUrl() {
    url = document.URL;
    if (url.indexOf('zendesk') > -1 && url.indexOf('tickets') > -1) {
        urlArray = url.split('/');
        ticketNum = urlArray[urlArray.length - 1];
        
        questionMarkIndex = ticketNum.indexOf('?')
        if (questionMarkIndex > -1) {
            ticketNum = ticketNum.substring(0, questionMarkIndex);
        }
        return ticketNum;
    }
    return "";
}

function ticketFromHighlightedFrame() {
    var highlightedTicket = $("* .ticket:hover");
    var ticketText = highlightedTicket.children(".date").text();
    if (ticketText !== undefined) {
        var ticketNumber = ticketText.substring(ticketText.indexOf('#') + 1);
        return ticketNumber.substring(0, ticketNumber.indexOf(' '));
    }    
    return "";
}

function ticketFromNotice() {
    var notice = $('#notice').first();
    if (notice.length !== 0) {
    	return notice.text().substring(8, 14);
    }
    return "";
}

function ticketFromHighlighted() {
    var tooltipId = $("*[aria-describedby*='ui']").attr('aria-describedby');
    if (tooltipId !== undefined){
        var ticketText = $('#'+tooltipId + ' * .title').text();
        var ticketNumber = ticketText.substring(ticketText.indexOf('#') + 1);
        return ticketNumber.substring(0, ticketNumber.indexOf(' '));
    }
    return "";
}