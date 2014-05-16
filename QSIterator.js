/**
 * QSIterator.js
 *
 * this file is here to make QSIterator() available globally (for console js scripts)
 *
 * QSIterators can be used to QSIterator over several QS elements and *do something*
 * the key method is QSIterator.afterLoad(), which allows asynchronous functions
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
 * @param maxIters		(optional) max number of loops to execute
 * @param increment		(optional) number to increment this.elem by in each loop
							defaults to 1
 *
 * important/useful methods:
 * @method start        call the first loop()
 * @method afterLoad    wait for QS to load before continuing
 * @method next         repeat the process on the next loop
 *                          no need to wrap in afterLoad() here
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
    this._nextElem();
    qsIteratorEndNow = false;
}

QSIterator.prototype.start = function() {
    this._loop();
}

/** Call this each time to restart the loop */
QSIterator.prototype.next = function() {
    this.afterLoad(function() {
        if (this._nextElem()) {
            this._loop();
        }
    });
};

/** 
 * Use to click a button on the screen, such as Save & Close
 * @param buttonTitle   the element's (button's) title/text
 * @return boolean      whether anything that has a click event was found/clicked
 */
QSIterator.prototype.click = function(buttonTitle) {
	// output like: button:contains(Save), .allButtons:contains(Save)
    var buttons = $("button" + ":contains(" + buttonTitle + ")"
		+ ", .allbuttons" + ":contains(" + buttonTitle + ")");
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
    this.clickAll("Cancel") // loading dialog
    this.clickAll("Close")
    this.clickAll("Back to list");
    qsIteratorEndNow = false;
};

QSIterator.prototype.clickAll = function(buttonTitle) {
    while (this.click(buttonTitle, false));
}

QSIterator.prototype.quit = function() {
    this.close();
    throw new Error("Aborted JS");
};

QSIterator.prototype.afterLoad = function(callback, param) {
    callback = callback.bind(this);
    var quit = this.quit.bind(this);
    
    var loadingSelector = "*[class^='load']:visible:not(.ribbonSelectorWidget *)";
    var load = setInterval(function() {
        if (qsIteratorEndNow) {
            clearInterval(load);
            quit();
        } else if (!$(loadingSelector).length) {
            clearInterval(load);
            callback(param);
        }
    }, 10);
};

QSIterator.prototype._loop = function() {
    this.loopFunc();
}

/**
 * set this.elem to the next elem or trigger end condition
 * 
 * @return boolean whether or not there was another elem to select
 */
QSIterator.prototype._nextElem = function() {
	this.currentIndex = (this.useFirst) ? 0 : this.currentIndex + this.increment;
    if (this.currentIndex < this.elems.length
			&& (this.maxIters === undefined || this.currentIndex < this.maxIters)) {
        this.elems = $(this.selector);  // always refresh the elems
        this.elem = this.elems.get(this.currentIndex);
        return true;
    } else {
        console.log("All Done");
        return false;
    }
};

/* static version of afterLoad for external use
 * TODO merge this into a single function with afterLoad */
QSIterator.staticAfterLoad = function(callback, param) {
    var load = setInterval(function() {
        if (!$("*[class^='load']:visible:not(.ribbonSelectorWidget *)").length) {
            clearInterval(load);
            callback(param);
        } 
    }, 10);
}

/* for cancelling QSIterator loops */
qsIteratorEndNow = false;
$(window).keypress(function(e) {
    if (e.which === 3) {
        qsIteratorEndNow = true;
    }
});