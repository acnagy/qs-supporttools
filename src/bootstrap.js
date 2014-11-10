function qsInjectJS(filename) {
    $("head").append(
        $("<script src='" + chrome.extension.getURL(filename) + "'></script>")
    );
}

function qsInjectScriptSupport() {
    scriptSupportFileNames = ["QSIterator.js", "QSTableIterator.js",
        "QSZeusIterator.js", "QSScraper.js", "QSGradebookIterator.js",
        "QSImporter.js", "extend.js", "CSVWriter.js"];
    for (var i = 0; i < scriptSupportFileNames.length; i++) {
        qsInjectJS("src/scriptsupport/" + scriptSupportFileNames[i]);
    }
    console.log("All QS Support Tools scripts have been injected.");
}


(function() {
    var url = document.URL;
    if(url.match("quickschools.com") || url.match("smartschoolcentral.com")) {
        qsInjectScriptSupport();
    }
})();
