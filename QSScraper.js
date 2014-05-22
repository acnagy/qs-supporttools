// 
//  QSScraper.js
//  Rick Nagy
//  2014-05-22
// 

/**
 * Use for scraping data off of QS Pages
 * 
 * Useful for making "exports" that wouldn't be otherwise possible
 * this.data is an array - fill it with objects.
 * Each property (from all objects) gets a column in the CSV. If an object
 *      has no value for a given property, the cell will be empty.
 * 
 * Exports as CSV file that's immediately downloaded
 */

function QSScraper() {
    this.data = [];
    this.properties = [];
}

/**
 * Adds an object to the data array.
 * If the object has a property that is new, it's added to this.properties
 */
QSScraper.prototype.add = function(object) {    
    for (var propertyName in object) {
        if (this.properties.indexOf(propertyName) < 0) {
            this.properties.push(propertyName);
        }
    }
    this.data.push(object);
};

/**
 * Exports file as a CSV file that gets downloaded
 * 
 * @param filename      the filename, without extension (optional)
 */
QSScraper.prototype.export = function(filename) {
    filename = filename || "Scraped QS Data";
    
    for (var i = 0; i < this.data.length; i++) {
        var entry = this.data[i];
        for (var j = 0; j < this.properties.length; j++) {
            var prop = this.properties[j];
            if (!entry.hasOwnProperty(prop)) {
                entry[prop] = "";
            }
        }
    }
    
    json2csv(this.data, function(err, csv) {
        if (err) {
            console.log(err);
        } else {
            downloadFile(csv, filename + ".csv");
        }
    });
};

/**
 * Makes a file then initiates a download
 * from http://jsfiddle.net/koldev/cW7W5/
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
