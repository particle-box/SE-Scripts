// ==SE_module==
// name: flexi_quotes
// displayName: FlexiQuote: Customizable Motivation
// description: A script that shows customizable motivation quotes on Snapchat startup, with options for dialog or toast notifications.
// version: 5.2
// updateUrl: https://raw.githubusercontent.com/particle-box/SE-Scripts/main/scripts/flexi_quotes.js
// author: ΞTΞRNAL & bocajthomas
// ==/SE_module==

var networking = require("networking");
var messaging = require("messaging");
var config = require("config");
var im = require("interface-manager");
var ipc = require("ipc");
var javaInterfaces = require("java-interfaces");
var hooker = require("hooker");
var events = require("events");

var goodbyePrompt = "Sorry to see you go :( I hope you liked my script :D";
var hasShownWelcome = "hasShownWelcome";

if (!config.getBoolean(hasShownWelcome, false)) {
    longToast("Thank you for installing my script! Hope you like it :D");
    config.setBoolean(hasShownWelcome, true, true);
}

var owner = "particle-box";
var repo = "SE-Scripts";
var scriptName = "flexi_quotes";
var currentVersion = "v5.2";
let updateAvailable = false;

var versionJsonUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/version.json`;
var messagesJsonUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/messages.json`;

var quotesJsonUrl = `https://raw.githubusercontent.com/${owner}/Script-UPDT/main/networking/quotes.json`;

function checkForNewVersion() {
    networking.getUrl(versionJsonUrl, (error, response) => {
        if (error) {
            console.error("Error fetching version.json:", error);
            return;
        }
        try {
            var versions = JSON.parse(response);
            var latestVersion = versions[scriptName];
            if (currentVersion !== latestVersion) {
                longToast("A new version of flexi quotes is available! Please refresh the scripts page.");
                updateAvailable = true;
            }
        } catch (e) {
            console.error("Error parsing version.json:", e);
        }
    });
}

function checkForNewMessages() {
    networking.getUrl(messagesJsonUrl, (error, response) => {
        if (error) {
            console.error("Error fetching messages.json:", error);
            return;
        }
        try {
            var messages = JSON.parse(response);
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                var messageId = message.id;
                if (!config.getBoolean(`message_${messageId}`, false)) {
                    longToast(message.text);
                    config.setBoolean(`message_${messageId}`, true);
                    config.save();
                    break;
                }
            }
        } catch (e) {
            console.error("Error parsing messages.json:", e);
        }
    });
}

var defaultFontSize = 20;
var defaultColor = "#4CAF50";

var settingsContext = {
    events: [],
};

function showQuote(activity, quote, fontSize, fontColor, useToast) {
    activity.runOnUiThread(() => {
        if (useToast) {
            longToast(quote);
        } else {
            var myDialog = im.createAlertDialog(activity, (builder, dialog) => {
                builder.text(quote)
                    .fontSize(fontSize)
                    .color(fontColor);
            });
            myDialog.show();
        }
    });
}

function fetchAndShowQuote(activity, callback) {
    networking.getUrl(quotesJsonUrl, (error, response) => {
        if (error) {
            console.error("Error fetching quotes.json:", error);
            longToast("Error loading quotes. Please check your internet connection and repository settings.");
            return;
        }

        try {
            var quotes = JSON.parse(response);

            var allRead = true;
            for (var i = 0; i < quotes.length; i++) {
                if (!config.getBoolean(`quote_${quotes[i]}`, false)) {
                    allRead = false;
                    break;
                }
            }

            if (allRead) {
                for (var i = 0; i < quotes.length; i++) {
                    config.delete(`quote_${quotes[i]}`);
                }
                config.save();
            }

            var unreadQuotes = [];
            for (var i = 0; i < quotes.length; i++) {
                if (!config.getBoolean(`quote_${quotes[i]}`, false)) {
                    unreadQuotes.push(quotes[i]);
                }
            }

            if (unreadQuotes.length > 0) {
                var randomIndex = Math.floor(Math.random() * unreadQuotes.length);
                var selectedQuote = unreadQuotes[randomIndex];

                config.setBoolean(`quote_${selectedQuote}`, true);
                config.save();

                if (callback) {
                    callback(selectedQuote);
                }
            } else {
                console.log("All quotes have been read.");
                if (callback) {
                    callback(null);
                }
            }
        } catch (e) {
            console.error("Error parsing quotes.json:", e);
            longToast("Error parsing quotes. Please ensure quotes.json is in the correct format.");
        }
    });
}

function sendChatMessage(conversationId, message, callback) {
    messaging.sendChatMessage(conversationId, message, callback);
}

function createConversationToolboxUI() {
    im.create("conversationToolbox", function (builder, args) {
        try {
            var conversationId = args["conversationId"];

            builder.row(function (builder) {
                builder.button("➡️ Send Motivation Quote", function () {
                    networking.getUrl(quotesJsonUrl, (error, response) => {
                        if (error) {
                            console.error("Error fetching quotes.json:", error);
                            longToast("Error loading quotes. Please check your internet connection and repository settings.");
                            return;
                        }

                        try {
                            var quotes = JSON.parse(response);

                            var allRead = true;
                            for (var i = 0; i < quotes.length; i++) {
                                if (!config.getBoolean(`quote_${quotes[i]}`, false)) {
                                    allRead = false;
                                    break;
                                }
                            }

                            if (allRead) {
                                for (var i = 0; i < quotes.length; i++) {
                                    config.delete(`quote_${quotes[i]}`);
                                }
                                config.save();
                            }

                            var unreadQuotes = [];
                            for (var i = 0; i < quotes.length; i++) {
                                if (!config.getBoolean(`quote_${quotes[i]}`, false)) {
                                    unreadQuotes.push(quotes[i]);
                                }
                            }

                            if (unreadQuotes.length > 0) {
                                var randomIndex = Math.floor(Math.random() * unreadQuotes.length);
                                var selectedQuote = unreadQuotes[randomIndex];

                                sendChatMessage(conversationId, selectedQuote, function () {
                                    longToast("Motivation quote sent!");
                                });

                                config.setBoolean(`quote_${selectedQuote}`, true);
                                config.save();
                            } else {
                                console.log("All quotes have been sent! They will reset soon.");
                                longToast("All quotes have been sent! They will reset soon.");
                            }
                        } catch (e) {
                            console.error("Error parsing quotes.json:", e);
                            longToast("Error parsing quotes. Please ensure quotes.json is in the correct format.");
                        }
                    }); 
                });
            })
                .arrangement("spaceBetween")
                .fillMaxWidth()
                .padding(4);

            builder.row(function (builder) {
                builder.text("⚙️ v5.2")
                    .fontSize(12)
                    .padding(4);

                builder.text("👨‍💻 Made By ΞTΞRNAL")
                    .fontSize(12)
                    .padding(4);
            })
                .arrangement("spaceBetween")
                .alignment("centerVertically")
                .fillMaxWidth();

            if (updateAvailable) {
                builder.row(function (builder) {
                    builder.text("📢 A new update is available! Please refresh the scripts page & then click on Update Module.")
                        .fontSize(12)
                        .padding(4);
                })
                    .arrangement("center")
                    .fillMaxWidth();
            }

        } catch (error) {
            console.error("Error in createConversationToolboxUI: " + JSON.stringify(error));
        }
    });
}


function createManagerToolBoxUI() {
    settingsContext.events.push({
        start: function (builder) {
            builder.row(function (builder) {
                builder.text("Random Quotes are enabled.");
            });

            var fontSizes = [12, 16, 20, 24, 28, 32, 36];
            var oldSelectedFontSize = config.getInteger("fontSize", defaultFontSize);
            builder.row(function (builder) {
                var text = builder.text("Font Size: " + oldSelectedFontSize);
                builder.slider(0, fontSizes.length - 1, fontSizes.length - 1, fontSizes.indexOf(oldSelectedFontSize), function (value) {
                    var fontSize = fontSizes[value];
                    text.label("Font Size: " + fontSize);
                    config.setInteger("fontSize", fontSize, true);
                });
            });

            builder.row(function (builder) {
                builder.textInput("Enter Custom Color (hex)", config.get("customColor", defaultColor), function (value) {
                    var trimmedValue = value.trim();
                    if (trimmedValue === "") {
                        config.set("customColor", defaultColor, true);
                    } else {
                        config.set("customColor", trimmedValue, true);
                    }
                }).maxLines(1)
                    .singleLine(true);
            });

            builder.row(function (builder) {
                builder.button("Test Hex Codes", function () {
                    testHexCode();
                });
            });

            builder.row(function (builder) {
                var text = builder.text("Notification Type: " + (config.getBoolean("useToast", false) ? "Toast" : "Dialog"));
                builder.slider(0, 1, 1, config.getBoolean("useToast", false) ? 1 : 0, function (value) {
                    var useToast = value === 1;
                    text.label("Notification Type: " + (useToast ? "Toast" : "Dialog"));
                    config.setBoolean("useToast", useToast, true);
                });
            });
        },
    });
}

function isValidHex(hex) {
    return /^#([0-9A-Fa-f]{6})$/.test(hex);
}

function testHexCode() {
    const customColor = config.get("customColor", defaultColor);

    if (isValidHex(customColor)) {
        longToast("Entered HEX Code is valid!");
    } else {
        longToast("Entered HEX Code is invalid!");
    }
}

function hexToColor(hex) {
    if (!isValidHex(hex)) {
        return parseInt('FF' + defaultColor.substring(1), 16);
    }
    return parseInt('FF' + hex.substring(1), 16);
}


function start() {
    createManagerToolBoxUI();
    createConversationToolboxUI();
}

start();

im.create("settings" /* EnumUI.SETTINGS */, function (builder, args) {
    settingsContext.events.forEach(function (event) {
        event.start(builder, args);
    });
});

module.onUnload = () => {
    longToast(goodbyePrompt);
    config.setBoolean(hasShownWelcome, false, true);
}

module.onSnapMainActivityCreate = activity => {
    fetchAndShowQuote(activity, function(quote) {
        if (quote) {
            var fontSize = config.getInteger("fontSize", defaultFontSize);
            var fontColor = hexToColor(config.get("customColor", defaultColor));
            var useToast = config.getBoolean("useToast", false);
            showQuote(activity, quote, fontSize, fontColor, useToast);
        }
    });
    checkForNewVersion();
    checkForNewMessages();
};
