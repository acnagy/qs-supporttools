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
	if (dashboardOrControl(tab) == "control") {
		parseSchoolcodes(tab);	
	} else if (dashboardOrControl(tab) == "dashboard") {
		parseZopim(tab);
	}
});

function parseZopim(tab) {
	chrome.tabs.sendRequest(tab.id, {method: "getText"}, function(response) {
		var lines = response.data.split('\n');
		var urls = [];

		for (var i = 0; i < lines.length; i++) {
			// is a url line
			if (lines[i].indexOf('http') !== -1) {
				var start = lines[i].indexOf('//') + 2;
				var end = lines[i].indexOf('.quickschools');
				urls.push(lines[i].substring(start, end));
			}
		}
		
		chrome.storage.sync.get("QSSchoolCodes", function(response) {
			alert(response.QSSchoolCodes.match(urls.getUnique()));
		})
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
	chrome.tabs.sendRequest(tab.id, {method: "getText"}, function(response) {
		if (response.method=="getText") {
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
		alert('Schoolcodes saved. You can now search Zopim for any schoolcode on this report.')
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