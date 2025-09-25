// ==SE_module==
// name: custom_toast
// displayName: Custom Toast
// description: A Script that shows a custom toast on the startup of Snapchat.
// version: 1.6
// author: Gabriel Modz, bocajthomas, Jimothy & ΞΞRNAL
// ==/SE_module==

// Ensure module object exists
globalThis.module = globalThis.module || { exports: {} };

// Bindings (may be unavailable on some sides)
var config = require("config");
var im = require("interface-manager"); // may be undefined on non-manager sides

var defaultPrompt = "Welcome back to Snapchat";

function getCustomPrompt() {
    var v = config && typeof config.get === "function"
        ? config.get("customPrompt", defaultPrompt)
        : defaultPrompt;
    v = (v == null ? "" : String(v));
    return v.length ? v : defaultPrompt;
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
                        if (config && typeof config.set === "function") {
                            config.set("customPrompt", String(value || ""), true);
                        }
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

// Define and export hooks explicitly on globalThis.module
Object.defineProperty(globalThis.module, "onBridgeConnected", {
    value: function (reloaded) {
        // no-op; keep defined to avoid “Path not found”
    },
    configurable: true,
    writable: true,
});

Object.defineProperty(globalThis.module, "onSnapEnhanceLoad", {
    value: function (androidContext) {
        createManagerToolBoxUI();
    },
    configurable: true,
    writable: true,
});

Object.defineProperty(globalThis.module, "onSnapApplicationLoad", {
    value: function (androidContext) {
        // optional
    },
    configurable: true,
    writable: true,
});

Object.defineProperty(globalThis.module, "onSnapMainActivityCreate", {
    value: function (activity) {
        module.longToast(getCustomPrompt());
    },
    configurable: true,
    writable: true,
});
