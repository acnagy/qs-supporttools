//
//  QSIterator.js
//  Rick Nagy
//  2014-05-10
//


/**
 *
 * this file is here to make QSIterator() available globally (for console js scripts)
 *
 * QSIterators can be used to QSIterator over several QS elements and *do something*
 * the key method is QSIterator.afterLoad(), which allows asynchronous functions\
 *
 * Subclass with: ClassUtil.inherit(SubClass, this, QSIterator)
 *
 * pass in a(n) (anonymous) function as loopFunc to determine the behavior
 * loopFunc is called in each loop with this.elem() also updated
 * use click, saveAndClose, etc, making it asynchronous
 * **loopFunc must call this.next() at the end to restart the loop**
 *
 * if useFirst is true, the first result is focused every iteration.
 *
 * @param selector      the jQuery selector to use to find the elements
 *                          **this is mandatory and very important**
 * @param loopFunc      the function that is called in each loop
 *                          **this is also mandatory and deteremines the behavior**

 * @param useFirst      (optional) always use the first element.
 *                          use this if the action element is removed in each loop
 * @param maxIters      (optional) max number of loops to execute
 * @param increment     (optional) number to increment this.elem by in each loop
                            defaults to 1
 *
 * important/useful methods:
 * @method start        call the first loop()
 * @method afterLoad    wait for QS to load before continuing
 * @method click        click a button on the page
 * @method close        click all Close buttons (no call to next())
 * @method quit         quit the process
 *
 * static methods:
 * @method staticAfterLoad  static version of afterLoad
 */

function QSIterator(selector, loopFunc, useFirst, maxIters, increment) {
    this.selector = selector;
    this.useFirst = useFirst === undefined ? false : useFirst;
    this.increment = increment === undefined ? 1 : increment;

    this.loopFunc = loopFunc;
    this.maxIters = maxIters;
    this.currentIndex = 0 - this.increment;
    this.loopCount = 0;
    this.intervals = [];
    this.elems = $(this.selector);
    this.pauseAfterFirstLoop = false;
    qsIteratorEndNow = false;
    this.isChild = false;
    this.makeUpdates = true;
    this.originalDocumentTitle = document.title;
}

/**
 * Start the loop process. THis is all that's required to run the loop,
 *  since the rest is iterative.
 */
QSIterator.prototype.start = function() {
    this.startTime = Date.now();
    if(this.nextElem()) {
        this._loop();
    } else {
        this.complete("Found no elements matching selector");
    }
};

/**
 * Run this.start(), but pause before second loop
 */
QSIterator.prototype.runOnce = function() {
    this.completeAfterFirstLoop = true;
    this.start();
};

/**
 * Set what happens after completion
 * Completion is after loopFunc on last elem OR on this.complete()
 */
QSIterator.prototype.onComplete = function(callback) {
    this.onCompletionCallback = (this.parentIterator) ?
        callback.bind(this.parentIterator) :
        callback;
    return this;
};

/**
 * is called to go back to the beginning of the loop
 * subclass to change what happens after being done with the current elem
 */
QSIterator.prototype.next = function() {
    this.afterLoad(function() {
        if(this.completeAfterFirstLoop) {
            this.complete();
            return;
        }
        
        if(this.nextElem()) {
            this._loop();
        } else {
            this.complete("Complete: no more elements matching selector");
        }
    });
};

/**
 * Use to click a button on the screen, such as Save & Close
 * @param buttonTitle   the element's (button's) title/text. This can be an
 *      array of titles to try in order of priority. So,
 *      ["Save & Close", "Save"] will try to click a button entitled
 *      "Save & Close", and then if there isn't a "Save & Close" button it'll
 *      try "Save".
 * @param onlyButtons   only click buttons. Defaults to true
 * @param selector      additional selector for elements to try
 * @return boolean      whether anything that has a click event was found/clicked
 */
QSIterator.prototype.click = function(buttonTitle, onlyButtons, selector) { 
    onlyButtons = onlyButtons || false;
    selector = selector || "*";
    
    var tryTitle = function(title) {
        // output like: button:contains(Save), .allButtons:contains(Save)
        var buttonSelector = selectorBase + ":contains(" + title + ")" +
            ", .allbuttons" + ":contains(" + title + ")";
        if(title === "Close") {
            buttonSelector += ":not(:contains(Save & Close))";
        }
        var buttons = $(buttonSelector).filter(selector);
        
        for (var i = buttons.length - 1; i >= 0; i--) {
            var button = buttons.eq(i);
            var data = button.data("events");
            if(data !== undefined && data.click !== undefined) {
                button.click();
                return true;
            }
        }
        return false;
    };
    var buttonTitles = Array.isArray(buttonTitle) ? buttonTitle : [buttonTitle];
    var selectorBase = (onlyButtons) ? "button" : "*";
    for (var i = 0; i < buttonTitles.length; i++) {
        if(tryTitle(buttonTitles[i])) {
            return true;
        }
    }
    return false;
};

QSIterator.prototype.closeDialog = function() {
    return this.click("Cancel") ||
        this.click("Close") ||
        this.clickAll("Back to list") ||
        $(".ui-dialog-titlebar-close").click();
};

QSIterator.prototype.closeAll = function() {
    this.clickAll("Cancel"); // loading dialog
    this.clickAll("Close");
    this.clickAll("Back to list");
    $(".ui-dialog-titlebar-close").click();
};

QSIterator.prototype.clickAll = function(buttonTitle) {
    while (this.click(buttonTitle, false));
};

QSIterator.prototype.complete = function(message) {
    this.clearAfterNestedLoad();
    if(this.onCompletionCallback) {
        this.onCompletionCallback();
    }
    this.quit(message, false, false);
};

QSIterator.prototype.quit = function(reason, closeAll, isError) {
    isError = (typeof isError === "undefined") ? true : isError;
    closeAll = (typeof closeAll === "undefined") ? true : closeAll;

    this.clearAfterNestedLoad();
    this.clearIntervals();
    if(closeAll) {
        this.closeAll();
    }
    if(isError) {
        console.error(reason);
    } else {
        console.log(reason);
    }
    if(!this.isChild) {
        document.title = this.originalDocumentTitle;
    }
};

/**
 * Pauses iteration as is (though can't be resumed)
 * Alternative to quit that doesn't close everything
 */
QSIterator.prototype.pause = function(message) {
    message = message ? ": " + message : "";
    this.quit("Paused" + message, false, false);
};

/**
 * call callback once the loading dialog disappears
 * To call callback with params, bind them!
 *
 * @param callback          the function to call - must be in this.prototype
 * @param stopCondition     function to determine whether to stop or not
                                return true to stop
 */
QSIterator.prototype.afterLoad = function(callback, stopCondition) {
    this.afterLoadHasBeenCalled = true;

    var loadingSelector = "*[class^='load']:not(.ribbonSelectorWidget *):not(button>span.loading-section):visible:";
    // TODO: try using :hidden here?
    stopCondition = (stopCondition || function() {
        return $(loadingSelector).filter(function() {
            return $(this).height() > 0 && $(this).width() > 0;
        }).length === 0;
    }).bind(this);

    callback = callback || function() {};
    var callbackString = callback.toString();
    callback = callback.bind(this);

    var callAfterNestedLoads = function(){};
    if(!callbackString.match("afterLoad") &&
            this.afterNestedLoadsCallback) {
        callAfterNestedLoads = this.afterNestedLoadsCallback.bind(this);
    }
    callback = callback.bind(this);
    var quitFunc = this.quit.bind(this);

    var load = setInterval(function() {
        if(qsIteratorEndNow) {
            clearInterval(load);
            quitFunc("Cancelled via keyboard");
        } else if(stopCondition.call()) {
            clearInterval(load);
            callback();
            // callAfterNestedLoads();
        }
    }, 50);
    this.intervals.push(load);
};


/**
 * get a callback when a nested set of afterLoad()s finishes
 * i.e. once the last afterLoad callback is done, callbackAfter is fired
 * callbackAfter is either called from afterLoad or here
 *
 * TODO: avoid race conditions with parallel calls to this
 *
 * @param funcWithNesting   function with nested calls to afterLoad
 * @param callbackAfter     function to call once all nested calls have complete
 */
QSIterator.prototype.withCallbackAfter = function(funcWithNesting, callbackAfter) {
    this.afterLoadHasBeenCalled = false;

    this.afterNestedLoadsCallback = function() {
        this.clearAfterNestedLoad();
        callbackAfter.call(this);
    };

    funcWithNesting.call(this);
    if(!this.afterLoadHasBeenCalled && this.afterNestedLoadsCallback) {
        this.afterNestedLoadsCallback();
    }
};

QSIterator.prototype.clearAfterNestedLoad = function() {
    this.afterNestedLoadsCallback = null;
};

/**
 * Clear any outstanding timers
 */
QSIterator.prototype.clearIntervals = function() {
    this.intervals.forEach(clearInterval);
};

/**
 * Add a child Iterator and start it, then call a callback on completion
 * kinda like afterLoad, but instead of a load a child iter is called.
 * Do NOT run multiple children in parallel!
 *
 * @param callback          callback when child finishes
 * @param otherIterator     the other QSIterator
 */
QSIterator.prototype.afterChildIterator = function(callback, childIter) {
    callback = (callback || function(){}).bind(this);
    this.currentChild = childIter;

    this.currentChild.parentIterator = this;
    this.currentChild.isChild = true;
    this.currentChild.makeUpdates = false;
    this.childComplete = false;
    this.currentChild.onComplete(function() {
        this.childComplete = true;
        this.currentChild = null;
        callback();
    });
    this.currentChild.start();
};

/**
 * The internal code to run on each loop
 * override to change what happens in each loop other than loopFunc
 */
QSIterator.prototype._loop = function() {
    if(this.pauseAfterFirstLoop && this.loopCount > 0) {
        this.pause();
    } else {
        this.afterLoad(function() {
            this.loopCount ++;
            if(this.makeUpdates) {
                this.statusUpdate();
            }
            this.loopFunc();
            // this.withCallbackAfter(this.loopFunc, this.next);
        });
    }
};

QSIterator.prototype.statusUpdate = function() {
    var iterStatus = this.statusString();
    console.log("Status:" + iterStatus);
    document.title = iterStatus;
};

QSIterator.prototype.statusString = function() {
    var elapsed = (Date.now() - this.startTime) / 1000;
    var totalCount = this.maxIters || this.elems.length;
    var leftSeconds = ((totalCount * elapsed) / this.loopCount) - elapsed;

    var hours = Math.floor(leftSeconds / 3600);
    var minutes = Math.floor((leftSeconds % 3600) / 60);
    var seconds =  Math.round(leftSeconds - (hours * 3600 + minutes * 60));

    var leftArray = hours ? [hours, minutes, seconds] : [minutes, seconds];
    leftArray.forEach(function(elemVal, i, elems) {
        elems[i] = (elemVal < 10 && i > 0) ? "0" + elemVal : elemVal;
    });
    var leftString = leftArray.join(":");

    var progress = Math.round((this.loopCount / totalCount) * 1000) / 10;
    return "Left: " + leftString + ", Done: " + progress + "%";
};

/**
 * set this.elem to the next elem or trigger end condition
 *
 * @return boolean whether or not there was another elem to select
 */
QSIterator.prototype.nextElem = function() {
    if(this.useFirst) {
        this.currentIndex = 0;
    } else {
        this.currentIndex ++;
    }
    
    if((this.currentIndex < this.elems.length) &&
            (this.maxIters === undefined || this.currentIndex < this.maxIters)) {
        this.elems = $(this.selector);  // always refresh the elems
        this.elem = this.elems.eq(this.currentIndex);
        return true;
    } else {
        return false;
    }
};

// ====================
// = Static Functions =
// ====================

/**
 * Get a QueryPanel input box by label
 *
 * @param label QueryPanel label
 * @param firstOnly: return the first result and ignore any warnings of mulitple
 *  labels
 * @param allowMultiple: allow multiple elems to be returned. this overrides
 *      firstOnly.
 * @return jQuery object of the input
 * 
 * to get ALL the matching inputs by label, call like this:
 *      QSIterator.qpInputByLabel("labelText", false, true);
 */
QSIterator.qpInputByLabel = function(label, firstOnly, allowMultiple) {
    firstOnly = firstOnly || true;
    var qpInput = $(".tableLabel:contains(" + label + "):visible")
        .next(".tableValue")
        .find("div:nth-child(1)")
        .find("input,select,textarea");
    if(allowMultiple) {
        return qpInput;
    } else if(qpInput.length === 1 || firstOnly) {
        return qpInput.first();
    } else {
        console.warn("Incorrect number of elems:", qpInput.length, "found for label: ", label, qpInput);
        return null;
    }
};

/**
 * Set a QueryPanel val by label
 * @param label the QueryPanel label
 * @param val   the val to set
 */
QSIterator.setQPVal = function(label, val) {
    var qpInput = QSIterator.qpInputByLabel(label);
    if(qpInput) {
        if(qpInput.is("select") && !qpInput.html().match(val)) {
            console.warn("Tried to set invalid val:", val, "on select from QP label:", label, qpInput);
        } else if(qpInput.parents(".easySelectorWidget").length) {
            qpInput.parents(".item").find(".delete").click();
            qpInput.next(".resultsHolder")
                .find("li:contains(" + val + ")")
                .click();
        } else {
            qpInput.click()
                .focus()
                .val(val)
                .blur()
                .change();
        }
        if(qpInput.find(".hasDatepicker")) {
            $("#ui-datepicker-div").hide();
        }
    }
};

QSIterator.getQPVal = function(label) {
    var qpInput = QSIterator.qpInputByLabel(label);
    if(qpInput) {
        return qpInput.val();
    }
};

/**
 * Clicks the "delete" button for elements (such as criteria values)
 * that are deleted with a hovering blue X.
 *
 * @param elem  the elem to hover over
 */
QSIterator.clickHoverDelete = function(elem) {
    if(elem.length !== 1) {
        console.warn("Wrong number of elems passed to clickHoverDelete", elem);
        return;
    }
    elem.mouseover();
    $(".iconHolder:last").click();
};

/**
 * Set the value on a DropDownWidget.
 */
QSIterator.setDropdownVal = function(dropdown, val) {
    dropdown.val(val);
    dropdown.change();
};

/* static version of afterLoad for external use
 * TODO: merge this into a single function with afterLoad */
function qsAfterLoad(callback, param) {
    var load = setInterval(function() {
        if(!$("*[class^='load']:visible:not(.ribbonSelectorWidget *)").length) {
            clearInterval(load);
            callback(param);
        }
    }, 100);
}


/* loads on all pages for cancelling QSIterator loops */
qsIteratorEndNow = false;
$(window).keypress(function(e) {
    if(e.which === 3) {
        qsIteratorEndNow = true;
    }
});
var qsIteratorEndNow = false;
