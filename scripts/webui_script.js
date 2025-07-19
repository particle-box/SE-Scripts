// ==SE_module==
// name: webui_script
// displayName: WebUI Script
// description: This script displays a WebUI in Snapchat which allows you to play Games, read News, listen to the Radio, etc.
// version: 1.0
// author: ΞTΞRNAL & bocajthomas
// updateUrl: https://raw.githubusercontent.com/particle-box/SE-Scripts/main/scripts/webui_script.js
// permissions: unsafe-classloader
// ==/SE_module==

(function () {
  'use strict';

  var im = require("interface-manager");
  var config = require("config");
  var networking = require("networking");

  var hasShownWelcome = "webview_toolbox_hasShownWelcome";
  var goodbyePrompt = "Thanks for using the WebUI Script!";
  
  if (!config.getBoolean(hasShownWelcome, false)) {
    longToast("Thank you for installing the WebUI script!");
    config.setBoolean(hasShownWelcome, true, true);
  }

  var owner = "particle-box";
  var repo = "SE-Scripts";
  var scriptName = "webui_script";
  var currentVersion = "v1.0";
  let updateAvailable = false;

  var versionJsonUrl = `https://raw.githubusercontent.com/owner}/${repo}/main/version.json`;
  var messagesJsonUrl = `https://raw.githubusercontent.com/owner}/${repo}/main/messages.json`;

  function checkForNewVersion() {
    networking.getUrl(versionJsonUrl, (error, response) => {
        if (error) { return; }
        try {
            var versions = JSON.parse(response);
            var latestVersion = versions[scriptName];
            if (latestVersion && currentVersion !== latestVersion) {
                longToast("A new version of WebUI Script is available!");
                updateAvailable = true;
            }
        } catch (e) { }
    });
  }

  function checkForNewMessages() {
    networking.getUrl(messagesJsonUrl, (error, response) => {
        if (error) { return; }
        try {
            var messages = JSON.parse(response);
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                var messageId = `webview_toolbox_message_${message.id}`;
                if (!config.getBoolean(messageId, false)) {
                    longToast(message.text);
                    config.setBoolean(messageId, true, true);
                    break; 
                }
            }
        } catch (e) { }
    });
  }

  var mainActivity = null;

  module.onSnapMainActivityCreate = activity => {
    mainActivity = activity;
    checkForNewVersion();
    checkForNewMessages();
  };

  module.onUnload = () => {
      longToast(goodbyePrompt);
  };

  function openWebView(activity, url, title) {
    activity.runOnUiThread(() => {
        try {
            const WebViewClass = findClass("android.webkit.WebView", true);
            const AlertDialogBuilderClass = findClass("android.app.AlertDialog$Builder", true);
            const ContextClass = findClass("android.content.Context", true);
            const WebViewClientClass = findClass("android.webkit.WebViewClient", true);

            const webViewConstructor = WebViewClass.getConstructor(ContextClass);
            const webView = webViewConstructor.newInstance(activity);

            const settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);

            webView.setWebViewClient(WebViewClientClass.getConstructor().newInstance());

            webView.loadUrl(url);

            const builderConstructor = AlertDialogBuilderClass.getConstructor(ContextClass);
            const builder = builderConstructor.newInstance(activity);
            builder.setView(webView);
            builder.setTitle(title);
            
            builder.setPositiveButton("Close", (dialog, which) => {
                dialog.dismiss();
            });
            
            const dialog = builder.create();
            
            dialog.setOnDismissListener((dialogInterface) => {
                if (webView) {
                    webView.destroy();
                }
            });

            dialog.show();

        } catch (error) {
            console.error("Failed to create WebView dialog: " + error.toString());
        }
    });
  }

  function showSelectionDialog(activity) {
    activity.runOnUiThread(() => {
      var selectionDialog = im.createAlertDialog(activity, (builder, dialog) => {
        
        builder.row(rowBuilder => {
          rowBuilder.text("🌐 WebUI").fontSize(22);
        }).arrangement("center").fillMaxWidth();

        builder.text("").fontSize(8);
        builder.row(rowBuilder => {
            rowBuilder.text("Explore a world of content with a single click!").fontSize(16);
        }).arrangement("center").fillMaxWidth();
        builder.text("").fontSize(15);

        builder.row(rowBuilder => {
            rowBuilder.text("🎮 Games").fontSize(18);
            rowBuilder.button("🚀 Open", () => openWebView(activity, "https://poki.com/", "Games"));
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(10);
         builder.row(rowBuilder => {
            rowBuilder.text("📰 News").fontSize(18);
            rowBuilder.button("🚀 Open", () => openWebView(activity, "https://en.m.wikinews.org/wiki/Main_Page", "News"));
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(10);
         builder.row(rowBuilder => {
            rowBuilder.text("📻 Radio").fontSize(18);
            rowBuilder.button("🚀 Open", () => openWebView(activity, "https://tunein.com/", "Radio"));
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(15);
        builder.row(rowBuilder => {
            rowBuilder.text("------------------------------");
        }).arrangement("center").fillMaxWidth();

        builder.row(rowBuilder => {
            rowBuilder.text("🙏 Credits: bocajthomas").fontSize(12);
            rowBuilder.text("👨‍💻 Made By ΞTΞRNAL").fontSize(12);
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(10);

        builder.row(rowBuilder => {
          rowBuilder.button("❌ Close", () => dialog.dismiss());
        }).arrangement("center").fillMaxWidth();
      });

      selectionDialog.show();
    });
  }

  function createToolboxUI() {
    im.create("conversationToolbox", (builder, args) => {
      try {
        builder.button("🌐 Open", () => {
          if (mainActivity) {
            showSelectionDialog(mainActivity);
          } else {
            console.error("Main activity not available yet. Cannot open dialog.");
          }
        });
      } catch (error) {
        console.error("Error creating the WebView toolbox UI: " + JSON.stringify(error));
      }
    });
  }

  function start() {
    createToolboxUI();
  }

  start();

})();
