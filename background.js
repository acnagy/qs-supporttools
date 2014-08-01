//
//  background.js
//  Rick Nagy
//  2014-04-23
//

// goo.gl/CevJ6G
Array.prototype.getUnique = function() {
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

Array.prototype.match = function(toMatch) {
	var matchedArray = []
	for (var i = 0; i < this.length; i++) {
		if (toMatch.indexOf(this[i]) > -1) matchedArray.push(this[i]);
	}
	return matchedArray;
}

String.prototype.contains = function(searchString) {
    return (this.indexOf(searchString) > -1);
}

// =====================================================================
// = Either get online trial schools or parse trial schools on Control =
// =====================================================================

// Called when the user clicks on the page action.
chrome.pageAction.onClicked.addListener(function(tab) {
	var title = chrome.pageAction.getTitle({'tabId' : tab.id}, function(){});
	if (isOutreachReport(tab.url)) parseSchoolcodes(tab);
	else if (isZopim(tab.url)) parseZopim(tab);
});

function switchToPageURL(tab) {
	chrome.tabs.update(tab.id, {'url' : 'https://dashboard.zopim.com/#Visitor_List/page_url'}, function() {
		parseZopim(tab);
	});
}

// ========================================
// = Parse Zopim for online trial schools =
// ========================================

function parseZopim(tab) {
	chrome.tabs.sendMessage(tab.id, {method: "getText"}, function(response) {
		if (response.data.indexOf('Group by Page URL') < 0) {
			if (confirm("The script needs to run on the Visitor List, grouped by Page URL. Would you like to switch to that view now?"));
				switchToPageURL(tab);
			return;
		}

		var lines = response.data.split('\n');

		if (lines)

		var urls = [];
		for (var i = 0; i < lines.length; i++) {
			// is a url line
			if (lines[i].indexOf('http') !== -1) {
				var start = lines[i].indexOf('//') + 2;
				var end = lines[i].indexOf('.quickschools');
				urls.push(lines[i].substring(start, end));
			}
		}

		// alert user
		chrome.storage.sync.get("QSSchoolCodes", function(response) {
			// will throw lastError if QSSchoolCodes key doesn't exist
			if (chrome.runtime.lastError) {
				alert("Please go to Control and run this script on a CSO report before looking for prospect schools on Zopim.");
				return;
			}

			var alertText = '';
			var schoolCodes = response.QSSchoolCodes;
			if (typeof schoolCodes === 'undefined' || schoolCodes.length === 0) {
				alertText = "There are no trial schools on file. Go to Control --> Reports --> Customer Outreach and click on the QuickSchools icon to save all of the trial schools to match here.";
			} else {
				var onlineSchools = urls.getUnique().match(response.QSSchoolCodes);
				var prospectSchols = urls.match(['www']);
				if (onlineSchools.length === 0) alertText = 'There are no trial schools online right now'
				else {
					if (onlineSchools.length === 1) alertText = 'There is one trial school with users online right now:\n';
					else alertText = 'There are ' + onlineSchools.length + ' schools with users online right now:\n'
					for (var i = 0; i !== onlineSchools.length; i++) {
						alertText += '\n' + onlineSchools[i];
					}

				}

				if (prospectSchols.length !== 0) {
					if (prospectSchols.length === 1) alertText += '\n\nThere is also a prospect user';
					else alertText += '\n\nThere are also ' + prospectSchols.length + ' prospect users';
				} else {
					alertText += '\n\nThere are no prospect users';
				}

				alertText +=  ' on the QuickSchools homepage (www.quickschools.com/*).';
				alertText += '\n\nBe sure to refresh the trial school list daily by clicking on the QS icon from the Customer Outreach reports.'
			}
			alert(alertText);
		});
	});
}

function isOldZendesk(url) {
    return url.match(".com/tickets/") != null;
}

function isZopim(url) {
    return url.match("dashboard.zopim.com") != null;
}

function isOutreachReport(url) {
    return url.match("Customer%20Outreach") != null;
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var url = changeInfo.url;
    if (url !== undefined) {
        if (isOldZendesk(url)) {
            // first since redirect speed is import
            redirectToNewZD(tab);
        } else if (isOutreachReport(url)) {
    		chrome.pageAction.setTitle({
                    'tabId' : tabId,
                    'title' : 'QS Support Tools'
            });
    	    chrome.pageAction.show(tabId);
    	} else if (isZopim(url)) {
    		chrome.pageAction.setTitle({
                'tabId' : tabId,
                'title' : 'Find Online Trial Schools'
            });
    		chrome.pageAction.show(tabId)
    	}
    }
});

// =================================================
// = Redirect old ZD pages to new ZD when possible =
// =================================================

function redirectToNewZD(tab) {
    chrome.tabs.update(tab.id, {url: newZdUrl(tab.url)});
}

function newZdUrl(oldUrl) {
    return oldUrl.replace("tickets", "agent/#/tickets");
}

// ==============================================================
// = Parse school codes on Control for collecting Trial schools =
// ==============================================================

function parseSchoolcodes(tab) {
	chrome.tabs.sendMessage(tab.id, {method: "getText"}, function(response) {
		if (response.method === "getText") {
			var text = response.data;
			var rows = text.split('\n');
			var codes = [];
			for (var i = 0; i < rows.length; i++) {
				var columns = rows[i].split('\t');
				var col = 0;

				// filter for header columns
				if (columns.length > 5) {
					// move left to right to find the schoolcode
					while (!isSchoolCode(columns[col]) && col < 20) col ++;
					codes.push(columns[col]);
				}
			}

			saveSchoolCodes(codes);
		}
	});
}

function saveSchoolCodes(schoolCodes) {
	chrome.storage.sync.set({'QSSchoolCodes' : schoolCodes}, function() {
		alert(schoolCodes.length.toString() + ' trial schools found and saved.\n\nNow go to the Zopim dashboard --> Visitor List, click the "Group by Page URL" button in the upper right, and click the QuickSchools icon in the URL bar to view all of the online trials.')
	});
}

function isSchoolCode(candidate) {
	if (candidate === undefined) return false
	// is it a date
	else if (candidate.indexOf('/') !== -1) return false;
	// is it a country or status
	else if (candidate.toLowerCase() !== candidate) return false;
	// is number of clicks
	else if (containsNumbers(candidate));
	// is '-'
	else if (candidate.indexOf('-') !== -1) return false;
	else return true;
}

// goo.gl/Ew5TDU
function containsNumbers(candidate) {
	var matches = candidate.match(/\d+/g);
	return (matches != null);
}



// =======================================
// = Switch to Dashboard and answer chat =
// =======================================
chrome.commands.onCommand.addListener(function(command) {
    if (command === "answerChat") {
    	chrome.tabs.query({url:'https://dashboard.zopim.com/*'}, function(tabs) {
    		var tabId = tabs[0].id
    		var windowId = tabs[0].windowId
    		if (tabs.length < 1) {
    			alert("Zopim dashboard isn't open.")
    		} else {
    			chrome.tabs.update(tabId, {active: true});
    			chrome.windows.update(windowId, {focused: true});
    			chrome.tabs.sendMessage(tabId, {method: command});
    		}
    	});
    } else if (command === "copyTicketNumber") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0]['id'], {method: command}, function(ticket) {
                if (!ticket) {
					// TODO: if there is no ticket, check the ticket number of all other tabs
                    ticket = {type: "none"};
                }
                if (ticket.type !== 'none') copyToClipboard(ticket.ticketNumber);
                notifyCopiedTicketNumber(ticket);
            });
        });
    }
});

// ==============================
// = Copy current ticket number =
// ==============================

function notifyCopiedTicketNumber(ticket) {
    var title = "";
    var message = "";
    var iconUrl = "";
    switch (ticket.type) {
        case "none":
            title = "No ticket found";
            message = "";
            iconUrl = "/images/icon.png";
            break;
        case "zendesk":
            title = "Zendesk ticket number copied";
            message = ticket.ticketNumber;
            iconUrl = "/images/zd.png";
            break;
        case "assembla":
            title = "Assembla ticket number copied";
            message = ticket.ticketNumber;
            iconUrl = "/images/assembla.png";
            break;
        default:
            return;
            break;
    }
    var opt = {
        type: "basic",
        title: title,
        message: message,
        iconUrl: iconUrl
    }
    chrome.notifications.create('', opt, function(notificationId){
        setTimeout(function() {
            chrome.notifications.clear(notificationId, function(){});
        }, 1000 * 5);
    });
}

function copyToClipboard(text){
    var copyDiv = document.createElement("textarea")
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.value = text;
    copyDiv.select();
    document.execCommand("Copy");
    document.body.removeChild(copyDiv);
}
