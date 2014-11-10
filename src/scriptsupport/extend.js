function extend(oldFunc, newFunc, callAfter) {
    callAfter = callAfter || true;
    if(callAfter) {
        return function() {
            var ret = oldFunc.apply(this, arguments);
            newFunc.apply(this, arguments);
            return ret;
        }
    } else {
        return function() {
            newFunc.apply(this, arguments);
            return oldFunc.apply(this, arguments);
        }
    }
}
