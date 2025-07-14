// ==SE_module==
// name: bypass_checker
// displayName: Bypass Checker
// description: A simple script which lets the users know through a toast message if the bypass is working on newer versions of Snapchat.
// version: 1.0
// updateUrl: https://raw.githubusercontent.com/particle-box/SE-Scripts/main/scripts/bypass_checker.js
// author: ΞTΞRNAL
// ==/SE_module==


if (currentSide === "manager") {
    /***********************************/
    /** MANAGER-SIDE CODE       **/
    /***********************************/

    var ipc = require("ipc");

    function checkLogsAndRespond() {
        var bypassFound = false;
        var logDirectoryPath = "/data/data/me.rhunk.snapenhance/cache/logs/";

        try {
            var File = type("java.io.File");
            var logDir = File.__new__(logDirectoryPath);

            if (logDir.exists() && logDir.isDirectory()) {
                var files = logDir.listFiles();
                if (files !== null) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (file.isFile()) {
                            var bufferedReader = type("java.io.BufferedReader").__new__(type("java.io.FileReader").__new__(file));
                            var line;
                            while ((line = bufferedReader.readLine()) !== null) {
                                if (line.includes("disablePlugin=true")) {
                                    bypassFound = true;
                                    break;
                                }
                            }
                            bufferedReader.close();
                            if (bypassFound) break;
                        }
                    }
                }
            }
        } catch (e) {
            logError("UnifiedLogChecker[Manager]: Error reading logs: " + e);
        }
        
        ipc.emit("bypass_status_response", bypassFound);
    }

    module.onSnapEnhanceLoad = () => {
        ipc.on("request_bypass_status", () => {
            checkLogsAndRespond();
        });
    };

} else if (currentSide === "core") {
    /********************************/
    /** CORE-SIDE CODE       **/
    /********************************/

    var ipc = require("ipc");
    var interfaces = require('java-interfaces');

    var hasAlreadyChecked = false;

    module.onSnapMainActivityCreate = activity => {
        if (hasAlreadyChecked) {
            return;
        }

        ipc.on("bypass_status_response", (args) => {
            var bypassStatus = args[0];
            
            activity.runOnUiThread(interfaces.runnable(() => {
                if (bypassStatus) {
                    longToast("Bypass is working!");
                } else {
                    longToast("Bypass is not working! Try reopening Snapchat.");
                }
            }));

            ipc.on("bypass_status_response", () => {});
        });

        ipc.emit("request_bypass_status");
        hasAlreadyChecked = true;
    };
}
