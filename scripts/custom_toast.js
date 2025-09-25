// ==SE_module==
// name: custom_toast
// displayName: Custom Toast
// description: A Script that shows a custom toast on the startup of Snapchat.
// version: 1.6
// author: Gabriel Modz, bocajthomas, Jimothy & ΞΞRNAL
// ==/SE_module==

(function () {
    // Ensure module object exists
    globalThis.module = globalThis.module || { exports: {} };

    // Safe require (Zipline require throws if binding is missing)
    function safeRequire(name) {
        try { return require(name); } catch (_) { return undefined; }
    }

    // Bindings
    var config = safeRequire("config");
    var im = safeRequire("interface-manager"); // available on manager side only

    var defaultPrompt = "Welcome back to Snapchat";

    function getCustomPrompt() {
        var v = (config && typeof config.get === "function")
            ? config.get("customPrompt", defaultPrompt)
            : defaultPrompt;
        v = (v == null ? "" : String(v));
        return v.length ? v : defaultPrompt;
    }

    function testCustomToast() {
        // Provided by host (JSModule.registerToastHelpers)
        if (module && typeof module.longToast === "function") {
            module.longToast(getCustomPrompt());
        }
    }

    function createManagerToolBoxUI() {
        // Only build if the interface-manager binding exists on this (manager) side
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

    // Helper to define lifecycle if missing or not a function
    function ensureLifecycle(name, fn) {
        if (typeof globalThis.module[name] !== "function") {
            try {
                globalThis.module[name] = fn;
            } catch (_) {
                try {
                    Object.defineProperty(globalThis.module, name, {
                        value: fn,
                        configurable: true,
                        writable: true,
                        enumerable: false
                    });
                } catch (_) { /* ignore */ }
            }
        }
    }

    // Manager-side hook: called when enabling the script or after load in manager
    ensureLifecycle("onSnapEnhanceLoad", function(/* androidContext */) {
        if (module.currentSide === "manager") {
            createManagerToolBoxUI();
        }
    });

    // Bridge connected on both sides (useful to re-register UI on manager)
    ensureLifecycle("onBridgeConnected", function(reloaded) {
        if (module.currentSide === "manager") {
            createManagerToolBoxUI();
        }
    });

    // Core-side app load: show the toast early in app lifecycle
    ensureLifecycle("onSnapApplicationLoad", function(/* androidContext */) {
        if (module.currentSide === "core") {
            testCustomToast();
        }
    });

    // Core-side: show the toast when main activity is created
    ensureLifecycle("onSnapMainActivityCreate", function(activity) {
        if (module.currentSide === "core" && typeof module.longToast === "function") {
            module.longToast(getCustomPrompt());
        }
    });
})();
