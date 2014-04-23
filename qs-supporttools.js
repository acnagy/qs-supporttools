// qs-supporttools
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.method === "answerChat") {
		$( ".incoming_button" ).first().click();
        $(".chat_bar_renderer.unread").first()
            .mouseover()
            .click();
	} else if (message.method === "getText") {
		sendResponse({data: document.documentElement.innerText, method:"getText"});
	} else if (message.method === "copyTicketNumber") {
        sendResponse(getTicketNumber());
	}
});

function getTicketNumber() {
    var type = "none";
    var ticket = "";
    var url = document.URL;
    
    if (url.indexOf("zendesk") > -1) {
        var zdTicket = getZendeskTicket();
        if (zdTicket !== "") {
            type = "zendesk";
            ticket = zdTicket;
        }
    } else if (url.indexOf("assembla") > -1) {
        var assemblaTicket = getAssemblaTicket();
        if (assemblaTicket !== "") {
            type = "assembla";
            ticket = assemblaTicket;
        }
    }

    return {type:type, ticketNumber:"#" + ticket};
}

function getZendeskTicket() {
    var ticket = ticketFromUrl();
    if (ticket === "") ticket = ticketFromPopupHTML5();
    if (ticket === "") ticket = ticketFromNotice();
    if (ticket === "") ticket = ticketFromHighlighted();
    if (ticket === "") ticket = ticketFromHighlightedFrame();
    return ticket;
}

function getAssemblaTicket() {
    var ticket = assemblaTicketFromUrl();
    if (ticket === "") ticket = highlightedAssemblaTicket();
    return ticket;
}
    
function assemblaTicketFromUrl() {
    var url = document.URL;
    if (url.indexOf("assembla") > -1 && url.indexOf("tickets") > -1) {
        var lastPath = url.split("/");
        lastPath = lastPath[lastPath.indexOf("tickets") + 1];
        return firstNumber(lastPath);
    }
    return "";
}

function highlightedAssemblaTicket() {
    return firstNumber($("tr:hover").children("td.number").text());
}

function ticketFromUrl() {
    var url = document.URL;
    if (url.indexOf("zendesk") > -1 && url.indexOf("tickets") > -1) {
        var urlArray = url.split("/");
        var ticketNum = urlArray[urlArray.length - 1];
        return firstNumber(ticketNum);
    }
    return "";
}

// =============
// = Old ZD UI =
// =============

function ticketFromHighlightedFrame() {
    var highlightedTicket = $("* .ticket:hover");
    var ticketText = highlightedTicket.children(".date").text();
    if (ticketText !== undefined) {
        var ticketNum = ticketText.substring(ticketText.indexOf("#") + 1);
        return ticketNum.substring(0, ticketNum.indexOf(" "));
    }    
    return "";
}

function ticketFromNotice() {
    var notice = $("#notice").first();
    if (notice.length !== 0) {
        return firstNumber(notice.text());
    }
    return "";
}

function ticketFromHighlighted() {
    var tooltipId = $("*[aria-describedby*='ui']").attr("aria-describedby");
    if (tooltipId !== undefined) {
        var ticketText = $("#" + tooltipId + " * .title").text();
        var ticket = ticketText.substring(ticketText.indexOf("#") + 1);
        return firstNumber(ticket);
    }
    return "";
}

// =============
// = New ZD UI =
// =============

function ticketFromPopupHTML5() {
    var text = $(".popover-title:visible").text();
    if (text !== "") {
        return firstNumber(text);
    }
    return "";
}

// http://stackoverflow.com/a/609588/1628796
function firstNumber(string) {
    matchArray = string.match(/\d+/);
    if (matchArray !== null) {
        return parseInt(matchArray[0], 10);
    } else {
        return "";
    }
}