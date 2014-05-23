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

function QSTableIterator(loopFunc, useFirst, maxIters, increment) {
    ClassUtil.inherit(QSTableIterator, this, QSIterator);
    this._super(this.SELECTOR, loopFunc, useFirst, maxIters, increment);
}

QSTableIterator.prototype.SELECTOR = ".dttd:nth-child(2):visible";

QSTableIterator.prototype._loop = function() {
	this.elem.click();
	this.superclass._loop.call(this);
};

QSTableIterator.prototype._next = function() {
    if (this.setCloseButtonText) {
        this.click(this.closeButtonText);
    } else {
        this.click("Save") || this.click("Save & Close");   
    }
	this.superclass._next.call(this);
};

/**
 * Set the text of the close button
 * overrides the default "Save & Close"
 */
QSTableIterator.prototype.setCloseButton = function(buttonText) {
    this.closeButtonText = buttonText;
};
