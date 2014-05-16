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
 */
if (document.URL.match("quickschools")) {
	var s = document.createElement("script");
	s.src = chrome.extension.getURL("QSIterator.js");
	s.onLoad = function() {
	    this.parentNode.removeChild(this);
	};
	(document.head||document.documentElement).appendChild(s);
}
