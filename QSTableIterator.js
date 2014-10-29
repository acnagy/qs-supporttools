//
//  QSTableIterator.js
//  Rick Nagy
//  2014-05-19
//

/**
 * Extends QSIterator
 * iterates through each entry in an Aura Data Table Widget
 *        such as transcripts, report cards, students, etc.
 * 
 * Each row is clicked before every iteration of loopFunc, and after each
 * iteration, the close button is clicked, useing the val from setCloseButton.
 *
 * @param loopFunc        the code to run in each entry after load
 * optional params are the same, and selector is removed
 */

function QSTableIterator(loopFunc, useFirst, maxIters, increment) {
    ClassUtil.inherit(QSTableIterator, this, QSIterator);
    this._super(this.SELECTOR, loopFunc, useFirst, maxIters, increment);
}

QSTableIterator.prototype.SELECTOR = ".dataTableWidget:first .dttd:last-child:visible";

QSTableIterator.prototype._loop = function() {
    this.elem.click();
    this.superclass._loop.call(this);
};

QSTableIterator.prototype.next = function(save) {
    save = (save === true || save === false) ? save : true;
    
    if (this.closeButtonText) {
        this.click(this.closeButtonText);
    } else if (save) {
        if (!this.click"Save & Close") && !this.click("Ok")) {
            if (this.click("Save") {
                this.afterLoad(function() {
                    this.click("Close");
                    this.superclass.next.call(this);
                });
                return;
            }
        }
    } else {
        this.closeDialog();
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
