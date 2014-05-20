// 
//  QSTableIterator.js
//  Rick Nagy
//  2014-05-19
// 

/**
 * Extends QSIterator
 * iterates through each entry in an Aura Data Table Widget
 *		such as transcripts, report cards, students, etc
 * 
 * @param loopFunc		the code to run in each entry after load
 * other params are the same, and selector is removed
 */

QSTableIterator.prototype = QSIterator.prototype;
function QSTableIterator(loopFunc, useFirst, maxIters, increment) {
	var SELECTOR = ".dttd:nth-child(2):visible";
	loopFunc = this.transformLoopFunc(loopFunc);
	
	QSIterator.call(this, SELECTOR, loopFunc, useFirst, maxIters, increment);
	this.next = this.tableNext;
}

QSTableIterator.prototype.transformLoopFunc = function(loopFunc) {
	return function() {
		this.elem.click();
		loopFunc();
		#TODO: OVERRIDE this.next
	}
}

QSTableIterator.prototype.tableNext = function() {
	if (!this.click("Save & Close")) {
		this.click("Save");
		this.afterLoad(function() {
			this.click("Close", false);
			QSIterator.next.call(this);
		})
	} else {
		QSIterator.next.call(this);
	}
};