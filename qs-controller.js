// 
//  qs-controller.js
//  Rick Nagy
//  2014-05-07
// 

/* controls other scripts in qs-supporttools
 * currently only loads QSIterator.js
 */

/* inject QSIterator.js into the page.
 * Makes QSIterator a globally accessible variable on QS pages
 * note that it means that all script injection is done once all resources have been loaded
 *      this is to avoid slowing down page rendering
 */
$(window).load(function() {
	if (document.URL.match("quickschools.com") ||
            document.URL.match("smartschoolcentral.com")) {
		injectScript("QSIterator.js");
		injectScript("QSTableIterator.js");
	}
});

function injectScript(filename) {
	$("head").append(
		$("<script src='" + chrome.extension.getURL(filename) + "'></script>")
	);
}
