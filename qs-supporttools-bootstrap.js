//
//  qs-controller.js
//  Rick Nagy
//  2014-05-07
//

/** 
 * Bootstrap the QS Support Tools load process. This injects the script that
 * then injects the scripts needed by QS Support Tools.
 */

$("head").append(
    $("<script src='" + chrome.extension.getURL("injectScripts.js") + "'></script>")
);

document.addEventListener('injectQSSupportToolsScripts', function() {
    injectQSSupportToolsScripts();
});

var injectQSSupportToolsScripts = function() {
    var injectScript = function(filename) {
        $("head").append(
            $("<script src='" + chrome.extension.getURL(filename) + "'></script>")
        );
    }
    injectScript("QSIterator.js");
    injectScript("QSTableIterator.js");
    injectScript("QSZeusIterator.js");
    injectScript("QSScraper.js");
    injectScript("QSGradebookIterator.js");
    injectScript("QSImporter.js");
    injectScript("extend.js");
    injectScript("CSVWriter.js");
    console.log("All QS Support Tools scripts have been refreshed.");
}
