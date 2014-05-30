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
    alert("going to next");
	this.elem.click();
    this.superclass._loop.call(this); 
};

QSTableIterator.prototype.next = function() {
    if (this.closeButtonText) {
        this.click(this.closeButtonText);
    } else {
        this.click("Save & Close") || (this.click("Save") && this.click("Close"));   
    }
	this.superclass.next.call(this);
};

/**
 * Set the text of the close button
 * overrides the default "Save & Close"
 */
QSTableIterator.prototype.setCloseButton = function(buttonText) {
    this.closeButtonText = buttonText;
};

/**
 * Set the default value from the tooltip for all of the elements passed in
 * 
 * @param           jQuery object with collection of elements to transform
 */
QSTableIterator.prototype.setDefaultValue = function(collection) {
	collection.each(function(i) {		
		$(this).mouseover();
		var newText = $(".tooltipWidget").text();
		$(".tooltipWidget").mouseover();
		newText = newText.replace(/(Default value:|\s)/g, "")
		$(this).click()
            .text(newText)
	});
    collection.blur();
}
