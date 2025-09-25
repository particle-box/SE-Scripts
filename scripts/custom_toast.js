// ==SE_module==
// name: custom_toast
// displayName: Custom Toast
// description: A Script that shows a custom toast on the startup of Snapchat.
// version: 1.6
// author: Gabriel Modz, bocajthomas, Jimothy & ΞΞRNAL
// ==/SE_module==

(function () {
    globalThis.module = globalThis.module || { exports: {} };

    // Bindings (now registered on both sides)
    var config = require("config");
    var im = require("interface-manager");

    var defaultPrompt = "Welcome back to Snapchat";

    function getCustomPrompt() {
        var v = (config && typeof config.get === "function")
            ? config.get("customPrompt", defaultPrompt)
            : defaultPrompt;
        v = (v == null ? "" : String(v));
        return v.length ? v : defaultPrompt;
    }

    function testCustomToast() {
        // Provided by host via JSModule.registerToastHelpers
        module.longToast(getCustomPrompt());
    }

    function createManagerToolBoxUI() {
        if (!im || typeof im.create !== "function") return;

        im.create("settings", function (builder /*, args */) {
            builder.row(function (b) {
                b.textInput(
                    "Type a Custom Toast here",
                    getCustomPrompt(),
                    function (value) {
                        if (config && typeof config.set === "function") {
                            config.set("customPrompt", String(value || ""), true);
                        }
                    }
                ).maxLines(8).singleLine(false);
            });

            builder.row(function (b) {
                b.button("Test Custom Toast", function () {
                    testCustomToast();
                });
            });
        });
    }

    // Manager-side: run when enabling through the manager
    module.onSnapEnhanceLoad = function () {
        if (module.currentSide === "manager") {
            createManagerToolBoxUI();
        }
    };

    // Both sides: re-register UI after reconnect
    module.onBridgeConnected = function (reloaded) {
        if (module.currentSide === "manager") {
            createManagerToolBoxUI();
        }
    };

    // Core-side: show the toast on app load
    module.onSnapApplicationLoad = function (/* androidContext */) {
        if (module.currentSide === "core") {
            testCustomToast();
        }
    };

    // Core-side: defined (no-op for this script) to satisfy host call
    module.onSnapMainActivityCreate = function (/* activity */) {
        // no-op
    };

    module.exports = {
        testCustomToast: testCustomToast
    };
})();
