// 
//  QSScraper.js
//  Rick Nagy
//  2014-05-22
// 

/**
 * Use for scraping _data off of QS Pages
 * 
 * Useful for making "exports" that wouldn't be otherwise possible
 * this._data is an array - fill it with objects.
 * Each property (from all objects) gets a column in the CSV. If an object
 *      has no value for a given property, the cell will be empty.
 * 
 * Exports as CSV file that's immediately downloaded
 */

function QSScraper() {
    this._data = [];
    this._properties = [];
}

/**
 * Adds an object to the _data array.
 * If the object has a property that is new, it's added to this._properties
 */
QSScraper.prototype.add = function(object) {    
    for (var propertyName in object) {
        if (this._properties.indexOf(propertyName) < 0) {
            this._properties.push(propertyName);
        }
    }
    this._data.push(object);
};

/**
 * Exports file as a CSV file that gets downloaded
 * 
 * @param filename      the filename, without extension (optional)
 */
QSScraper.prototype.export = function(filename) {    
    filename = filename || "Scraped QS _data";
    
    // this._updateProperties();
    var csvString = new CSV.writeRows(this._data);
    downloadFile(csv, filename + ".csv");
};

/**
 * Return this._data
 */
QSScraper.prototype.getData = function() {
    this._updateProperties();
    return this._data;
}

/**
 * Updates all entries in this._data to have the same _properties
 */
QSScraper.prototype._updateProperties = function() {
    for (var i = 0; i < this._data.length; i++) {
        var entry = this._data[i];
        for (var j = 0; j < this._properties.length; j++) {
            var prop = this._properties[j];
            if (!entry.hasOwnProperty(prop)) {
                entry[prop] = "";
            }
        }
    }
    
}

/**
 * Makes a file then initiates a download
 * adapted from http://jsfiddle.net/koldev/cW7W5/
 * 
 * @param fileBody          a string of the body of the file
 * @param filename          the filename
 */
var downloadFile = function(fileBody, filename) {
   var blob = new Blob([fileBody], {type: 'text/html'});
   var url = URL.createObjectURL(blob);
   
   var a = document.createElement("a");
   document.body.appendChild(a);
   a.href = url;
   a.download = filename;
   a.click();
   window.URL.revokeObjectURL(url);
   document.body.removeChild(a);
}
