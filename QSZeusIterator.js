function QSZeusIterator(loopFunc, useFirst, maxIters, increment) {
    ClassUtil.inherit(QSZeusIterator, this, QSTableIterator);
    this._super(loopFunc, useFirst, maxIters, increment);
    
    openPreviewChangesRequests = 0;
    this.overrideNativeFunction(function() {
        openPreviewChangesRequests --;
    });
}

QSZeusIterator.prototype._loop = function() {
	this.elem.click();
    this.afterLoad(function() {
        this.afterLoad(function() {
            QSIterator.prototype._loop.call(this);            
        }, undefined, function() {
            return $(".fullPageDialogArea div:last .linkWidget:contains(Close)").length > 0;
        });
    });
};

QSZeusIterator.prototype.next = function() {
    this.click("Save & Close");
    QSIterator.prototype.next.call(this);
}

/**
 * Set the default value from the tooltip for all of the elements passed in
 * 
 * @param           jQuery object with collection of elements to transform
 */
QSZeusIterator.prototype.setDefaultVal = function(collection, callback) {
	var defaultValueRegexp = /(Default|Current) value: (.*)/g;
    if (collection.length !== 1) {
        this.pause("Incorrect # of values found for selector: " + collection.selector);
    } else if (!collection.is(":visible")){
        this.pause("Trying to set val on invisible box: " + collection.selector)
    } else {
        collection.each(function() {		
    		$(this).mouseover();
    		var newText = $(".tooltipWidget").text();
    		$(".tooltipWidget").mouseover();
            
            var match = defaultValueRegexp.exec(newText)
            if (match) {
                newText = match[match.length - 1];
                if (newText !== $(this).text()) {
            		$(this).click()
                        .text(newText);
                    openPreviewChangesRequests ++;
                    $(this).blur();
                }   
            }
    	});
        this.afterLoad(callback, undefined, function() {
            return openPreviewChangesRequests <= 0;
        });
    }
};

/**
 * Override some existing, native function
 * Useful for hooking into callbacks
 * TODO: actually implement original! Now just hardcoding.
 * e.g.: callback when report card finishes processing changes
 * when new is called, the old function can be called with:
 *      original.apply(this, arguments);
 * 
 * @param original      the original, native function
 * @param newFunc       the new function with calls to original.apply(this, arguments);
 */
QSZeusIterator.prototype.overrideNativeFunction = function(newFunc) {
    this.originalOverridenFunction = EditZeusReportCard.prototype.retrievedChanges;
    var iterator = this;
    EditZeusReportCard.prototype.retrievedChanges = (function() {
       var original = EditZeusReportCard.prototype.retrievedChanges;
       return function() {
           var ret = original.apply(this, arguments);
           newFunc.call(iterator);
           return ret; 
       };
    }());
};

QSZeusIterator.prototype.quit = function() {
    EditZeusReportCard.prototype.retrievedChanges = this.originalOverridenFunction;
    this.superclass.quit.apply(this, arguments);
};
var openPreviewChangesRequests = 0;
