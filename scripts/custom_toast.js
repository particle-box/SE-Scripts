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

    // Define lifecycle safely even if other code fails
    function ensureLifecycle(name, fn) {
        if (typeof globalThis.module[name] !== "function") {
            try {
                Object.defineProperty(globalThis.module, name, {
                    value: fn,
                    configurable: true,
                    writable: true,
                    enumerable: false
                });
            } catch (_) {
                globalThis.module[name] = fn;
            }
        }
    }

    // Safe require (returns undefined if binding is missing)
    function safeRequire(name) {
        try { return require(name); }
        catch (_) { return undefined; }
    }

    var defaultPrompt = "Welcome back to Snapchat";

    function getConfig() { return safeRequire("config"); }
    function getIM() { return safeRequire("interface-manager"); }

    function getCustomPrompt() {
        var cfg = getConfig();
        var v = (cfg && typeof cfg.get === "function")
            ? cfg.get("customPrompt", defaultPrompt)
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
        var im = getIM();
        if (!im || typeof im.create !== "function") return;

        im.create("settings", function (builder /*, args */) {
            builder.row(function (b) {
                b.textInput(
                    "Type a Custom Toast here",
                    getCustomPrompt(),
                    function (value) {
                        var cfg = getConfig();
                        if (cfg && typeof cfg.set === "function") {
                            cfg.set("customPrompt", String(value || ""), true);
                        }
                    }
                ).maxLines(8).singleLine(false);
            });

            builder.row(function (b) {
                b.button("Test Custom Toast", function () { testCustomToast(); });
            });
        });
    }

    // Manager-side enable/load
    ensureLifecycle("onSnapEnhanceLoad", function () {
        if (module.currentSide === "manager") createManagerToolBoxUI();
    });

    // Both sides: re-register UI after reconnect
    ensureLifecycle("onBridgeConnected", function (reloaded) {
        if (module.currentSide === "manager") createManagerToolBoxUI();
    });

    // Core-side: show toast on app load
    ensureLifecycle("onSnapApplicationLoad", function () {
        if (module.currentSide === "core") testCustomToast();
    });

    // Core-side: defined to avoid errors
    ensureLifecycle("onSnapMainActivityCreate", function (/* activity */) {
        // no-op
    });

    module.exports = { testCustomToast: testCustomToast };
})();
