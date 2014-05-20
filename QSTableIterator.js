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
 * optional params are the same, and selector is removed
 */

QSTableIterator = QSIterator.extend(function(base) { return {
	SELECTOR: ".dttd:nth-child(2):visible",
	
	init: function(loopFunc, useFirst, maxIters, increment) {
		base.init.call(this, this.SELECTOR, loopFunc, useFirst, maxIters, increment);
	},
	
	_loop: function() {
		this.elem.click();
		base._loop.call(this);
	},
	
	next: function() {
		this.click("Save") || this.click("Save & Close");
		base.next.call(this);
	}
};});
