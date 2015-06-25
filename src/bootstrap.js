//
// bootstrap.js
// Rick Nagy
// 2014-11
//

function qsInjectJS(filename) {
    $("head").append(
        $("<script src='" + chrome.extension.getURL(filename) + "'></script>")
    );
}

function qsInjectScriptSupport(injectJQuery) {
    // TODO this doesn't work
    if(injectJQuery === true) {
        qsInjectJS("lib/jqeury.js");
        $("head").append(
            $("<script type='text/javascript'>$ = jQuery;</script>")
        );
        console.log("jQuery has been injected and set as $");
    }

    scriptSupportFileNames = ["QSIterator.js", "QSTableIterator.js",
        "QSZeusIterator.js", "QSScraper.js", "QSGradebookIterator.js",
        "QSImporter.js", "extend.js", "CSVWriter.js"];
    for (var i = 0; i < scriptSupportFileNames.length; i++) {
        qsInjectJS("src/scriptsupport/" + scriptSupportFileNames[i]);
    }
    
    console.log("All QS Support Tools JS has been injected.");
}

(function() {
    var url = document.URL;
    if(url.match("quickschools.com") ||
            url.match("smartschoolcentral.com") ||
            url.match("localhost:8080/sms/js/devlocal.html") ||
            url.match("localhost:8080/sms/js/local.html")) {
        qsInjectScriptSupport(false);
    }
})();

chrome.runtime.onMessage.addListener(function(message) {
    if(message.method === "injectScripts") {
        qsInjectScriptSupport(true);
    }
});

