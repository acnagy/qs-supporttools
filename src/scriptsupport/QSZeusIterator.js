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
 * @param   textField       text field to set default val on
 * @param   callback        callback to call once exec can continue
                                will be called whether textfield is changed or not
 */
QSZeusIterator.prototype.setZeusDefaultVal = function(textField, callback) {
    if(this.checkQueryForChangeZeusAnswer(textField)) {
        var defaultValueRegexp = /(Default|Current) value: (.*)/g;
        textField.mouseover();
        var newText = $(".tooltipWidget").text();
        $(".tooltipWidget").mouseover();
        match = defaultValueRegexp.exec(newText);
        if(match) {
            newText = match[match.length - 1];
            return this.setZeusAnswer(textField, newText, callback);
        }
    }
    callback();
    return false;
};

QSZeusIterator.prototype.checkQueryForChangeZeusAnswer = function(query) {
    if(query.length !== 1) {
        this.pause("Incorrect # of values found for selector: " + query.selector + ". Is " + query.length + ", should be 1.");
        return false;
    } else if(!query.is(":visible")){
        this.pause("Trying to set val on invisible box: " + query.selector);
        return false;
    }
    return true;
}

QSZeusIterator.prototype.setZeusAnswer = function(textField, newText, callback) {
    if(this.checkQueryForChangeZeusAnswer(textField)) {
        if(textField.text() === newText) {
            console.warn("Setting identical val: " + newText + " on text field", textField)
        }
        textField.click().text(newText);
        this.registerZeusChange();
        console.log("QSZeusIterator Set value " + newText + " on text field", textField)
        textField.blur();
        this.afterZeusLoad(callback);
        return true;
    }
    callback();
    return false;
}

QSZeusIterator.prototype.registerZeusChange = function() {
    openPreviewChangesRequests ++;
}

QSZeusIterator.prototype.afterZeusLoad = function(callback) {
    this.afterLoad(callback, function() {
        return openPreviewChangesRequests <= 0;
    });
}

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
           log("Report card data", this.reportCardData)
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
