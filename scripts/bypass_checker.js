// ==SE_module==
// name: bypass_checker
// displayName: Bypass Checker
// description: Checks if the bypass is working on newer versions of Snapchat and shows it as a toast.
// version: 1.5
// updateUrl: https://raw.githubusercontent.com/particle-box/SE-Scripts/main/scripts/bypass_checker.js
// author: ΞTΞRNAL
// ==/SE_module==

var messaging = require('messaging');

module.onSnapApplicationLoad = () => {
    try {
        var messagingClass = messaging.getClass();
        var modContextField = messagingClass.getDeclaredField("modContext");
        modContextField.setAccessible(true);
        var modContextInstance = modContextField.get(messaging);

        var modContextClass = modContextInstance.getClass();
        var disablePluginField = modContextClass.getDeclaredField("disablePlugin");
        disablePluginField.setAccessible(true);
        var isPluginDisabled = disablePluginField.get(modContextInstance);

        if (isPluginDisabled) {
            shortToast("Bypass is working!");
        } else {
            shortToast("Bypass is not working!");
        }
    } catch (e) {
        logError("Failed to check bypass status: " + e);
        shortToast("Could not determine bypass status.");
    }
};
