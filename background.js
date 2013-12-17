chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
 	lastTabId = tabs[0].id;
  	chrome.pageAction.show(lastTabId);
});

// Called when the user clicks on the page action.
chrome.pageAction.onClicked.addListener(function(tab) {
	parseSchoolcodes();	
});


// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
  // If the letter 'g' is found in the tab's URL...
  if (tab.url.indexOf('control.quickschools.com') > -1) {
    // ... show the page action.
    chrome.pageAction.show(tabId);
  }
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);


function parseSchoolcodes() {
	alert('hi');
	var text = document.documentElement.innerText;
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
	
	alert(codes);
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