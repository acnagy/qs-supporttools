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


// Called when the user clicks on the page action.
chrome.pageAction.onClicked.addListener(function(tab) {
	var title = chrome.pageAction.getTitle({'tabId' : tab.id}, function(){});
	if (dashboardOrControl(tab) == "control") parseSchoolcodes(tab);	
	else if (dashboardOrControl(tab) == "dashboard") parseZopim(tab);
});

function switchToPageURL(tab) {
	chrome.tabs.update(tab.id, {'url' : 'https://dashboard.zopim.com/#Visitor_List/page_url'}, function() {
		parseZopim(tab);	
	});
}

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


// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
	if (dashboardOrControl(tab) === "control") {
		chrome.pageAction.setTitle({'tabId' : tabId, 'title' : 'QS Online Trial Finder'});
	    chrome.pageAction.show(tabId);
	} else if (dashboardOrControl(tab) === "dashboard") {
		chrome.pageAction.setTitle({'tabId' : tabId, 'title' : 'Find Online Trial Schools'});
		chrome.pageAction.show(tabId)
	}
};

function dashboardOrControl(tab) {
	if (tab.url.indexOf('Customer%20Outreach') > -1) {
		return "control"
	} else if (tab.url.indexOf('dashboard.zopim.com') > -1) {
		return "dashboard"
	} else return "";
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

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
    			chrome.tabs.sendMessage(tabId, {method: command});
    			chrome.tabs.update(tabId, {active: true});
    			chrome.windows.update(windowId, {focused: true});
    		}
    	});
    } else if (command === "copyTicketNumber") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0]['id'], {method: command}, function(ticket) {
                if (ticket.type !== 'none') copyToClipboard(ticket.ticketNumber);
                notifyCopiedTicketNumber(ticket);
            });
        });
    }
});

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

function copyToClipboard( text ){
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
}
