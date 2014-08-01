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

function QSScraper(exportKeys) {
    this.exportKeys = exportKeys || [];
    this._data = [];
    return this;
}

/**
 * Adds an object to the _data array.
 * If the object has a property that is new, it's added to this._properties
 */
QSScraper.prototype.add = function(object) {
    this._data.push(object);
    console.log("Added data to a QSScraper", object)
};

/**
 * Exports file as a CSV file that gets downloaded
 *
 * @param filename      the filename, without extension (optional)
 */
QSScraper.prototype.export = function(filename) {
    filename = filename || "Scraped QS data";

    // this._updateProperties();
    var csv = new CSVWriter()
    if (this.exportKeys) {
        csv.writeHeader(this.exportKeys);
    }
    csv.writeRows(this._data);
    downloadFile(csv.getCSV(), filename + ".csv");
};

/**
 * Return this._data
 */
QSScraper.prototype.getData = function() {
    return this._data;
};

/**
 * Set the export keys in output file
 * Especially useful for setting the order of the header keys
 *
 * @param exportKeys        array of keys, in order of export
 */
QSScraper.prototype.setExportKeys = function(exportKeys) {
    this.exportKeys = exportKeys;
}

/**
 * Makes a file then initiates a download
 * adapted from http://jsfiddle.net/koldev/cW7W5/
 *
 * @param fileBody          a string of the body of the file
 * @param filename          the filename
 */
function downloadFile(fileBody, filename) {
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
