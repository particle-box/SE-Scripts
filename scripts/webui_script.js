// ==SE_module==
// name: webui_script
// displayName: WebUI Script
// description: This script displays a WebUI in Snapchat which allows you to play Games, read News, listen to the Radio, etc.
// version: 1.2
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
  var currentVersion = "v1.2";
  var updateAvailable = false;

  var versionJsonUrl = "https://raw.githubusercontent.com/" + owner + "/" + repo + "/main/version.json";
  var messagesJsonUrl = "https://raw.githubusercontent.com/" + owner + "/" + repo + "/main/messages.json";

  function checkForNewVersion() {
    networking.getUrl(versionJsonUrl, function (error, response) {
      if (error) {
        console.error("Error fetching version.json:", error);
        return;
      }
      try {
        var versions = JSON.parse(response);
        var latestVersion = versions[scriptName];
        if (latestVersion && currentVersion !== latestVersion) {
          longToast("A new version of WebUI Script is available!");
          updateAvailable = true;
        }
      } catch (e) {
        console.error("Error parsing version.json:", e);
      }
    });
  }

  function checkForNewMessages() {
    networking.getUrl(messagesJsonUrl, function (error, response) {
      if (error) {
        console.error("Error fetching messages.json:", error);
        return;
      }
      try {
        var messages = JSON.parse(response);
        for (var i = 0; i < messages.length; i++) {
          var message = messages[i];
          var messageId = "webview_toolbox_message_" + message.id;
          if (!config.getBoolean(messageId, false)) {
            longToast(message.text);
            config.setBoolean(messageId, true, true);
            break;
          }
        }
      } catch (e) {
        console.error("Error parsing messages.json:", e);
      }
    });
  }

  var mainActivity = null;

  module.onSnapMainActivityCreate = function (activity) {
    mainActivity = activity;
    checkForNewVersion();
    checkForNewMessages();
  };

  module.onUnload = function () {
    longToast(goodbyePrompt);
  };

  function openWebView(activity, url) {
    activity.runOnUiThread(function () {
      try {
        var WebViewClass = findClass("android.webkit.WebView", true);
        var DialogClass = findClass("android.app.Dialog", true);
        var ContextClass = findClass("android.content.Context", true);

        if (!WebViewClass || !DialogClass || !ContextClass) {
          console.error("Could not find required Android classes for WebView/Dialog.");
          return;
        }

        // Create WebView with the activity context
        var webViewConstructor = WebViewClass.getConstructor(ContextClass);
        var webView = webViewConstructor.newInstance(activity);

        var settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAppCacheEnabled(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccess(true);

        var cacheDir = activity.getCacheDir().getAbsolutePath();
        settings.setAppCachePath(cacheDir);

        webView.loadUrl(url);

        // Create Dialog using single parameter constructor with activity context (no theme)
        var dialogConstructor = DialogClass.getConstructor(ContextClass);
        var dialog = dialogConstructor.newInstance(activity);

        dialog.setContentView(webView);

        dialog.show();

      } catch (error) {
        console.error("Failed to create WebView dialog with activity context: ", error);
      }
    });
  }

  function showSelectionDialog(activity) {
    activity.runOnUiThread(function () {
      var selectionDialog = im.createAlertDialog(activity, function (builder, dialog) {

        builder.row(function (rowBuilder) {
          rowBuilder.text("🌐 WebUI").fontSize(22);
        }).arrangement("center").fillMaxWidth();

        builder.text("").fontSize(8);
        builder.row(function (rowBuilder) {
          rowBuilder.text("Explore a world of content with a single click!").fontSize(16);
        }).arrangement("center").fillMaxWidth();
        builder.text("").fontSize(15);

        builder.row(function (rowBuilder) {
          rowBuilder.text("🎮 Games").fontSize(18);
          builder.button("🚀 Open", function () { openWebView(activity, "https://poki.com/"); });
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(10);
        builder.row(function (rowBuilder) {
          rowBuilder.text("📰 News").fontSize(18);
          builder.button("🚀 Open", function () { openWebView(activity, "https://en.m.wikinews.org/wiki/Main_Page"); });
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(10);
        builder.row(function (rowBuilder) {
          rowBuilder.text("📻 Radio").fontSize(18);
          rowBuilder.button("🚀 Open", function () { openWebView(activity, "https://tunein.com/"); });
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(15);
        builder.row(function (rowBuilder) {
          rowBuilder.text("------------------------------");
        }).arrangement("center").fillMaxWidth();

        builder.row(function (rowBuilder) {
          rowBuilder.text("🙏 Credits: bocajthomas").fontSize(12);
          rowBuilder.text("👨‍💻 Made By ΞTΞRNAL").fontSize(12);
        }).arrangement("spaceBetween").alignment("centerVertically").fillMaxWidth();

        builder.text("").fontSize(10);

        builder.row(function (rowBuilder) {
          rowBuilder.button("❌ Close", function () { dialog.dismiss(); });
        }).arrangement("center").fillMaxWidth();
      });

      selectionDialog.show();
    });
  }

  function createToolboxUI() {
    im.create("conversationToolbox", function (builder, args) {
      try {
        builder.button("🌐 Open", function () {
          if (mainActivity) {
            showSelectionDialog(mainActivity);
          } else {
            console.error("Main activity not available yet. Cannot open dialog.");
          }
        });
      } catch (error) {
        console.error("Error creating the WebView toolbox UI: ", error);
      }
    });
  }

  function start() {
    createToolboxUI();
  }

  start();

})();
