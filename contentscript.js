// qs-supporttools
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.method === "answerChat") {
		$( ".meshim_dashboard_components_chatBar_ServeRequestButton" ).first().click()
	} else if (message.method === "getText") {
		sendResponse({data: document.documentElement.innerText, method:"getText"});
	} else if (message.method === "copyTicketNumber") {
        sendResponse(getTicketNumber());
	}
});

function getTicketNumber() {
    var type = "none";
    var ticket = "";
    
    var zdTicket = getZendeskTicket();
    var assemblaTicket = getAssemblaTicket();
    
    if (zdTicket !== "") {
        type = "zendesk";
        ticket = zdTicket;
    } else if (assemblaTicket !== "") {
        type = "assembla";
        ticket = assemblaTicket;
    }
    return {type:type, ticketNumber:'#' + ticket};
}

function getZendeskTicket() {
    var ticket = ticketFromUrl();
    if (ticket === "") ticket = ticketFromNotice();
    if (ticket === "") ticket = ticketFromHighlighted();
    if (ticket === "") ticket = ticketFromHighlightedFrame();
    return ticket;
}

function getAssemblaTicket() {
    var url = document.URL;
    if (url.indexOf("assembla") > -1 && url.indexOf('tickets') > -1) {
        var lastPath = url.split('/');
        lastPath = lastPath[lastPath.indexOf('tickets') + 1];
        poundIndex = lastPath.indexOf("#");
        if (poundIndex > -1) {
            lastPath = lastPath.substring(0, poundIndex);
        }
        return lastPath;
    }
    return "";
}

function ticketFromUrl() {
    var url = document.URL;
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
    	return numbersFromTicketString(notice.text());
    }
    return "";
}

function ticketFromHighlighted() {
    var tooltipId = $("*[aria-describedby*='ui']").attr('aria-describedby');
    if (tooltipId !== undefined){
        var ticketText = $('#'+tooltipId + ' * .title').text();
        var ticketNumber = ticketText.substring(ticketText.indexOf('#') + 1);
        return numbersFromTicketString(ticketNumber);
    }
    return "";
}

function numbersFromTicketString(string) {
    string = string.substring(string.indexOf('#') + 1);
    return string.substring(0, string.indexOf(' '));
}
