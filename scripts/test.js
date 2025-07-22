// ==SE_module==
// name: test
// displayName: Quick add Test
// description: Test
// version: 1.0
// author: ΞTΞRNAL
// permissions: unsafe-classloader
// ==/SE_module==

var networking = require("networking");
var messaging = require("messaging");
var config = require("config");
var im = require("interface-manager");

module.onSnapMainActivityCreate = function(activity) {
    try {
        const WebViewClass = findClass("android.webkit.WebView", true);
        const AlertDialogBuilderClass = findClass("android.app.AlertDialog$Builder", true);
        const CookieManagerClass = findClass("android.webkit.CookieManager", true);
        const ContextClass = findClass("android.content.Context", true);

        if (!WebViewClass || !AlertDialogBuilderClass || !ContextClass) {
            console.error("Required WebView classes not available.");
            return;
        }

        const webView = WebViewClass.getConstructor(ContextClass).newInstance(activity);

        const settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        settings.setUserAgentString(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        );

        webView.loadUrl("https://www.snapchat.com/web");

        const builder = AlertDialogBuilderClass.getConstructor(ContextClass).newInstance(activity);
        builder.setView(webView);
        builder.setTitle("Snapchat Web");
        builder.setPositiveButton("Close", null);

        const dialog = builder.create();
        dialog.show();
    } catch (e) {
        console.error("Failed to initialize WebView dialog:", e);
    }
};
