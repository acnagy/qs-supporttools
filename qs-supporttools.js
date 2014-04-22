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
        return numbersAtStart(lastPath);
    }
    return "";
}

function ticketFromUrl() {
    var url = document.URL;
    if (url.indexOf('zendesk') > -1 && url.indexOf('tickets') > -1) {
        urlArray = url.split('/');
        ticketNum = urlArray[urlArray.length - 1];
        return numbersAtStart(ticketNum);
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
    	return numbersAtStart(notice.text());
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

// http://stackoverflow.com/a/609588/1628796
function numbersAtStart(string) {
    return parseInt(string.match(/\d+/)[0], 10);
}