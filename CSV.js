// 
//  CSV.js
//  Rick Nagy (@br1ckb0t)
//  2014-05-23
//

/**
 * Global object for converting an array of objects to a CSV string
 */


/**
 * Convenience method for converting a JSON-serialiable object to CSV
 */
function objectsToCSV(rows) {
    var csv = new CSV();
    return csv.writeRows(rows);
}

/**
 * CSV file object for creating and adding a CSV file
 */
function CSV() {
    this._contents = "";
    this._headerKeys = [];
}

/**
 * Write all of the provided rows to the file, in the order provided
 * Uses the keys from the first object for the header
 *
 * @param rows      array the rows to write, in order    
 * @return          finished CSV
 */
CSV.prototype.writeRows = function(rows) {
    if (!(rows instanceof Array)) {
        rows = [rows];
    }
    rows.forEach(function(row) {
        this.writeRow(row);
    }, this);
    return this.getCSV();
};

/**
 * Writes the keys to the header, in the order provided
 * 
 * @param keys      array of keys to write, in the order
 */
CSV.prototype.writeHeader = function(keys) {
    if (!this._headerKeys.length) {
        this._headerKeys = keys;
        keys.forEach(function(key) {
            this.addVal(key);
        }, this);
        this.addNewline();
    }
};

/**
 * Write the row to the CSV, in the order of _headerKeys
 * If writeHeader has not been called, writes the header with the row's keys
 * Throws a warning if a key is in the row that isn't in the header
 * 
 * @param row       object to write. Must not have any keys not in the header
 */
CSV.prototype.writeRow = function(row) {
    if (!this._headerKeys.length) {
        this.writeHeader(Object.getOwnPropertyNames(row));
    }
    for (var propertyName in row) {
        if (this._headerKeys.indexOf(propertyName) < 0) {
            console.warn("Writing row to CSV with key not in header row, so value will not be included. Key: " + propertyName + ", row:", row);
        }
    }
    this._headerKeys.forEach(function(headerKey) {
        this.addVal(row[headerKey]);
    }, this);
    this.addNewline();
};

/**
 * Adds a string to the csv, including cleaning and a delimeter at the end
 * 
 * @param str       the string to add. Can null/undefined.
 */
CSV.prototype.addVal = function(str) {
    str = str || "";
    this._contents += JSON.stringify(str);
    this._contents += this.DELIMETER;
};

/**
 * Adds a newline to the end of the CSV
 * If necessary, strips a delimeter at the end of the current line
 */
CSV.prototype.addNewline = function() {
    this.stripLast(this.DELIMETER);
    this._contents += this.NEWLINE;
};

/**
 * Strip the last character of _contents, such as a delimeter or newline
 *
 * @param lastStr       the char to strip
 */
CSV.prototype.stripLast = function(lastStr) {
    var len = this._contents.length;
    if (this._contents.substring(len - lastStr.length) === lastStr) {
        this._contents = this._contents.substring(0, len - lastStr.length);
    }
}

/**
 * Value delimeter
 */
CSV.prototype.DELIMETER = ",";

/**
 * Newline delimeter
 */
CSV.prototype.NEWLINE = "\n";

CSV.prototype.getCSV = function() {
    this.stripLast(this.NEWLINE);
    return this._contents;
};
