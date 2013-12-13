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