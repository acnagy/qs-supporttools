// 
//  json2csv.js
//  adapted from github.com/zeMirco/json2csv/blob/master/lib/json2csv.js
// 

/**
 * Check passing params
 *
 * @param data                    the array of objects
 * @param callback(err, csv)      callback to call after completion
 */
function json2csv(data, callback) {
    var params = {data: data, fields: Object.getOwnPropertyNames(data[0])};
    json2csv.checkParams(params, function(err) {
      if (err) return callback(err);
      json2csv.createColumnTitles(params, function(err, title) {
        if (err) return callback(err);
        json2csv.createColumnContent(params, title, function(csv) {
          callback(null, csv);
        });
      });
    });
}

json2csv.checkParams = function(params, callback) {
  //#check params.data
  params.data = JSON.parse(JSON.stringify(params.data));

  // if data is an Object, not in array [{}], then just create 1 item array.
  // So from now all data in array of object format.
  if (!params.data instanceof Array) {
    var ar = new Array();
    ar[0] = params.data;
    params.data = ar;
  }

  //#check fieldNames
  if (params.fieldNames && params.fieldNames.length !== params.fields.length) {
    callback(new Error('fieldNames and fields should be of the same length, if fieldNames is provided.'));
  }

  params.fieldNames = params.fieldNames || params.fields;

  //#check delimiter
  params.del = params.del || ',';

  //#check hasCSVColumnTitle, if it is not explicitly set to false then true.
  if (params.hasCSVColumnTitle !== false) {
    params.hasCSVColumnTitle = true;
  }
  callback(null);
};

/**
 * Create the title row with all the provided fields as column headings
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {Function} callback Callback function returning error and title row as a string
 */
json2csv.createColumnTitles = function(params, callback) {
  var str = '';

  //if CSV has column title, then create it
  if (params.hasCSVColumnTitle) {
    params.fieldNames.forEach(function(element) {
      if (str !== '') {
        str += params.del;
      }
      str += JSON.stringify(element);
    });
  }
  callback(null, str);
};

/**
 * Create the content column by column and row by row below the title
 *
 * @param {Object} params Function parameters containing data, fields and delimiter
 * @param {String} str Title row as a string
 * @param {Function} callback Callback function returning title row and all content rows
 */
json2csv.createColumnContent = function(params, str, callback) {
  params.data.forEach(function(data_element) {
      var element_fields = Object.getOwnPropertyNames(data_element);
      //if null or empty object do nothing
      if (data_element && element_fields.length > 0) {
        var line = '';
        var eol = '\n';
        for (var property in data_element) {
            line += JSON.stringify(data_element[property]);
            line += params.del;
        }
        //remove last delimeter
        line = line.substring(0, line.length - 1);
        line = line.replace(/\\"/g, '""');
        str += eol + line;
      }
      });
    callback(str);
};
