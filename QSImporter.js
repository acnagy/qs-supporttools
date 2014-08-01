/** 
 * Tool for importing data into the QS GUI.
 * 
 * QSImporter.iterator allows one to iterate over QSImporter data and do
 * something with each entry such as click a button, enter some fields, then
 * hit save.
 */


var QSImporter = {};

QSImporter.iterator = function(loopFunc) {
    ClassUtil.inherit(QSImporter.iterator, this, QSIterator);
    loopFunc = loopFunc.bind(this);
    var newLoopFunc = function() {
        this.item = QSImporter.getData()[this.currentIndex];
        loopFunc();
    };
    this._super("*", newLoopFunc, true, QSImporter.getData().length);
};

QSImporter.iterator.test = function() {
    QSImporter.setData([{1: 1}, {2: 2}]);
    new QSImporter.iterator(function() {
        console.log(this.item);
        this.next();
    }).start();
};

QSImporter.setData = function(data) {
    _qsImporterData = data;
};

QSImporter.getData = function() {
    _qsImporterData = _qsImporterData || QSImporter.promptUser();
    return _qsImporterData;
};

QSImporter.promptUser = function() {
    return JSON.parse(prompt("JSON"));
};

var _qsImporterData = null;
