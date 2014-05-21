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
 * @param selector      the jQuery selector to use to find the elements
 *                          **this is mandatory and very important**
 * @param loopFunc     the function that is called in each loop
 *                          **this is also mandatory and deteremines the behavior**

 * @param useFirst      (optional) always use the first element.
 *                          use this if the action element is removed in each loop
 * @param maxIters        (optional) max number of loops to execute
 * @param increment        (optional) number to increment this.elem by in each loop
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
    this.elems = $(this.selector);
    qsIteratorEndNow = false;
}

/**
 * Start the loop process. THis is all that's required to run the loop,
 *  since the rest is iterative.
 */
QSIterator.prototype.start = function() {
    if (this._nextElem()) {
        this._loop();
    } else {
        this.quit("no elements matching selector", false, false);
    }
};

/** 
 * is called to go back to the beginning of the loop
 * subclass to change what happens after being done with the current elem
 */
QSIterator.prototype._next = function() {
    this.afterLoad(function() {
        if (this._nextElem()) {
            this._loop();
        } else {
            this.quit("finished: no more elements matching selector", undefined, false);
        }
    });
};

/** 
 * Use to click a button on the screen, such as Save & Close
 * @param buttonTitle   the element's (button's) title/text
 * @param onlyButtons    only click buttons. Defaults to true
 * @return boolean      whether anything that has a click event was found/clicked
 */
QSIterator.prototype.click = function(buttonTitle, onlyButtons) {
    var selectorBase = (onlyButtons) ? "button" : "*";

    // output like: button:contains(Save), .allButtons:contains(Save)
    var buttons = $(selectorBase + ":contains(" + buttonTitle + ")" +
        ", .allbuttons" + ":contains(" + buttonTitle + ")");
    for (var i = buttons.length - 1; i >= 0; i--) {
        var button = buttons.eq(i);
        var data = button.data("events");
        if (data !== undefined && data.click !== undefined) {
            button.click();
            return true;
        }
    }
    return false;
};

QSIterator.prototype.close = function() {
    this.clickAll("Cancel"); // loading dialog
    this.clickAll("Close");
    this.clickAll("Back to list");
    qsIteratorEndNow = false;
};

QSIterator.prototype.clickAll = function(buttonTitle) {
    while (this.click(buttonTitle, false));
};

QSIterator.prototype.quit = function(reason, close, isError) {
    isError = (typeof isError === "undefined") ? true : isError;
    close = (typeof close === "undefined") ? true : close;
    
    if (close) {
        this.close();
    }
    if (isError) {
        throw new Error(reason);
    } else {
        console.log(reason);
    }
    
};

/**
 * call callback once the loading dialog disappears
 *
 * @param callback      the function to call - must be in this.prototype
 * @param param         param for callback
 */
QSIterator.prototype.afterLoad = function(callback, param) {
    this.afterLoadHasBeenCalled = true;
    
    var callAfterNestedLoads = function(){};
    if (!callback.toString().match("afterLoad") &&
            this.afterNestedLoadsCallback) {
        callAfterNestedLoads = this.afterNestedLoadsCallback.bind(this);
    }
    var callback = callback.bind(this);
    var quit = this.quit.bind(this);

    var loadingSelector = "*[class^='load']:visible:not(.ribbonSelectorWidget *)";
    var load = setInterval(function() {
        if (qsIteratorEndNow) {
            clearInterval(load);
            quit("cancelled");
        } else if (!$(loadingSelector).length) {
            clearInterval(load);
            callback(param);
            callAfterNestedLoads();
        }
    }, 10);
};


/**
 * get a callback when a nested set of afterLoad()s finishes
 * i.e. once the last afterLoad callback is done, callbackAfter is fired
 * callbackAfter is either called from afterLoad or here
 *
 * TODO: avoid race conditions with parallel calls to this
 *
 * @param funcWithNesting   function with nested calls to afterLoad
 * @param callbackAfter     function to call once all nested calls have finished
 */
QSIterator.prototype.withCallbackAfter = function(funcWithNesting, callbackAfter) {
    this.afterLoadHasBeenCalled = false;
    
    this.afterNestedLoadsCallback = function() {
        this.afterNestedLoadsCallback = null;
        callbackAfter.call(this);
    };
    
    funcWithNesting.call(this);
    if (!this.afterLoadHasBeenCalled) {
        this.afterNestedLoadsCallback();
    }
}

/**
 * The internal code to run on each loop
 * override to change what happens in each loop other than loopFunc
 */
QSIterator.prototype._loop = function() {
    this.afterLoad(function() {
        this.withCallbackAfter(this.loopFunc, this._next);
    });
};

/**
 * set this.elem to the next elem or trigger end condition
 * 
 * @return boolean whether or not there was another elem to select
 */
QSIterator.prototype._nextElem = function() {
    this.currentIndex = (this.useFirst) ? 0 : this.currentIndex + this.increment;
    if (this.currentIndex < this.elems.length &&
            (this.maxIters === undefined || this.currentIndex < this.maxIters)) {
        this.elems = $(this.selector);  // always refresh the elems
        this.elem = this.elems.get(this.currentIndex);
        return true;
    } else {
        return false;
    }
};

/* static version of afterLoad for external use
 * TODO: merge this into a single function with afterLoad */
function qsAfterLoad(callback, param) {
    var load = setInterval(function() {
        if (!$("*[class^='load']:visible:not(.ribbonSelectorWidget *)").length) {
            clearInterval(load);
            callback(param);
        } 
    }, 10);
}

/* loads on all pages for cancelling QSIterator loops */
qsIteratorEndNow = false;
$(window).keypress(function(e) {
    if (e.which === 3) {
        qsIteratorEndNow = true;
    }
});
