/** 
 * Inject all scripts from Support Tools on the page.
 * 
 * This injects the script as if it were externally loaded, so any functions
 * become global variables.
 */
if (document.URL.match("quickschools.com") ||
        document.URL.match("smartschoolcentral.com")) {
    $(window).load(function() {
        injectAllScripts();
        $(window).keypress(function(e) {
            CTRL_B = 2;
            if (e.which === CTRL_B) {
                injectAllScripts();
            }
        });
    });
}

function injectAllScripts() {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent("injectQSSupportToolsScripts", true, true);
    document.dispatchEvent(event);
}
