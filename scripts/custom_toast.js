// ==SE_module==
// name: custom_toast
// displayName: Custom Toast
// description: Shows a custom toast on the startup of Snapchat.
// version: 1.6
// author: Gabriel Modz, bocajthomas, Jimothy & ΞTΞRNAL
// ==/SE_module==

// Bindings
var config = require("config");
var im = require("interface-manager"); // May be null if not registered on this side

var defaultPrompt = "Welcome back to Snapchat";

function getCustomPrompt() {
    var v = config.get("customPrompt", defaultPrompt);
    return (typeof v === "string" && v.length) ? v : defaultPrompt;
}

function testCustomToast() {
    module.longToast(getCustomPrompt());
}

function createManagerToolBoxUI() {
    if (!im || typeof im.create !== "function") return;

    im.create("settings", function (builder, args) {
        builder.row(function (builder) {
            builder
                .textInput(
                    "Type a Custom Toast here",
                    getCustomPrompt(),
                    function (value) {
                        config.set("customPrompt", String(value || ""), true);
                    }
                )
                .maxLines(8)
                .singleLine(false);
        });

        builder.row(function (builder) {
            builder.button("Test Custom Toast", function () {
                testCustomToast();
            });
        });
    });
}

// Manager-side: build settings UI when the manager loads scripts
module.onSnapEnhanceLoad = function (androidContext) {
    createManagerToolBoxUI();
};

// Core-side: show the toast when Snapchat’s main activity is created
module.onSnapMainActivityCreate = function (activity) {
    module.longToast(getCustomPrompt());
};
