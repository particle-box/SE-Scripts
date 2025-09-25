// ==SE_module==
// name: custom_toast
// displayName: Custom Toast
// description: A Script that shows a custom toast on the startup of Snapchat.
// version: 1.6
// author: Gabriel Modz, bocajthomas, Jimothy & ΞΞRNAL
// ==/SE_module==

(function () {
    // Ensure module exists
    globalThis.module = globalThis.module || { exports: {} };

    // Safe require (returns undefined if binding absent)
    function safeRequire(name) {
        try {
            return require(name);
        } catch (_) {
            return undefined;
        }
    }

    // Bindings
    var config = safeRequire("config");
    var im = safeRequire("interface-manager"); // only present on manager side

    var defaultPrompt = "Welcome back to Snapchat";

    function getCustomPrompt() {
        var v = (config && typeof config.get === "function")
            ? config.get("customPrompt", defaultPrompt)
            : defaultPrompt;
        v = (v == null ? "" : String(v));
        return v.length ? v : defaultPrompt;
    }

    function testCustomToast() {
        if (module && typeof module.longToast === "function") {
            module.longToast(getCustomPrompt());
        }
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
                )
                .maxLines(8)
                .singleLine(false);
            });

            builder.row(function (b) {
                b.button("Test Custom Toast", function () {
                    testCustomToast();
                });
            });
        });
    }

    // Ensure lifecycle hooks are functions
    function ensureLifecycle(name, fn) {
        if (typeof globalThis.module[name] !== "function") {
            try {
                globalThis.module[name] = fn;
            } catch (_) {
                try {
                    Object.defineProperty(globalThis.module, name, {
                        value: fn, configurable: true, writable: true, enumerable: false
                    });
                } catch (_) { /* ignore */ }
            }
        }
    }

    // Manager-side: build settings UI when script is enabled/loaded
    ensureLifecycle("onSnapEnhanceLoad", function () {
        if (module.currentSide === "manager") {
            createManagerToolBoxUI();
        }
    });

    // Both sides: re-register UI after bridge reconnects
    ensureLifecycle("onBridgeConnected", function (reloaded) {
        if (module.currentSide === "manager") {
            createManagerToolBoxUI();
        }
    });

    // Core-side: show the toast on app load
    ensureLifecycle("onSnapApplicationLoad", function () {
        if (module.currentSide === "core") {
            testCustomToast();
        }
    });

    // Core-side: defined to avoid errors; not needed for this script
    ensureLifecycle("onSnapMainActivityCreate", function (/* activity */) {
        // no-op
    });

    // Optional exports
    globalThis.module.exports = {
        testCustomToast: testCustomToast
    };
})();
