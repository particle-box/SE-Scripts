// ==SE_module==
// name: greetings_toast
// displayName: Greetings Toast
// description: A Script that shows a greetings toast on the startup of Snapchat. Enter your username and birthday in the format: username dd/mm/yyyy Note: Avoid including your full name as the toast will not work properly.                                     Eg: ΞTΞRNAL 20/01/1900. 
// version: 3.2
// author: ΞTΞRNAL
// credits: Gabriel Modz & bocajthomas & Jimothy
// ==/SE_module==

var networking = require("networking");
var messaging = require("messaging");
var config = require("config");
var im = require("interface-manager");
var ipc = require("ipc");
var javaInterfaces = require("java-interfaces");
var hooker = require("hooker");
var events = require("events");

var settingsContext = {
    events: [],
};

var greetingPresets = {
    morning: {
        Formal: [
            "Good morning, {username}. I hope your day is productive.",
            "Wishing you a successful morning, {username}.",
            "Good morning, {username}. May your day be filled with accomplishments.",
            "A formal good morning to you, {username}.",
            "Greetings, {username}. I trust your morning is going well.",
            "Good morning, {username}. I hope this day brings you success.",
            "Wishing you a professional and productive morning, {username}.",
            "Good morning, {username}. May your day be efficient and prosperous.",
            "A cordial good morning to you, {username}.",
            "Greetings and good morning, {username}. May your day be filled with achievement."
        ],
        Informal: [
            "Morning, {username}! Hope you slept well!",
            "Hey {username}, good morning!",
            "Rise and shine, {username}!",
            "Good morning, {username}! Ready for a great day?",
            "Morning, {username}! Let's make today awesome!",
            "Hey there, {username}! Good morning to you!",
            "Wakey wakey, {username}! It's a brand new day!",
            "Morning, sunshine! Hope you're ready for the day, {username}!",
            "Hey {username}, hope your morning's off to a good start!",
            "Good morning, {username}! Let's rock this day!"
        ],
        Humorous: [
            "Good morning, {username}! Did you remember to put your face on?",
            "Rise and shine, {username}! Or just rise, no pressure.",
            "Morning, {username}! I hope your coffee is as strong as your will to live today.",
            "Good morning, {username}! Remember, today is a gift. That's why they call it the present. Ba dum tss!",
            "Wakey wakey, eggs and bakey, {username}! Unless you're vegan, then it's... tofu and... no-fu?",
            "Good morning, {username}! Time to adult again. My condolences.",
            "Rise and grind, {username}! Or hit snooze and whine. Your choice!",
            "Morning, {username}! Just remember, your bed will always be there for you at the end of the day.",
            "Good morning, {username}! May your coffee be strong and your Monday be short.",
            "Wakey wakey, {username}! It's time to make the donuts... or eat them. Preferably eat them."
        ]
    },
    afternoon: {
        Formal: [
            "Good afternoon, {username}. I hope your day is progressing well.",
            "Wishing you a productive afternoon, {username}.",
            "Good afternoon, {username}. May the rest of your day be successful.",
            "A formal good afternoon to you, {username}.",
            "Greetings, {username}. I trust your afternoon is going smoothly.",
            "Good afternoon, {username}. I hope this afternoon brings you continued success.",
            "Wishing you a professional and efficient afternoon, {username}.",
            "Good afternoon, {username}. May your afternoon be productive and prosperous.",
            "A cordial good afternoon to you, {username}.",
            "Greetings and good afternoon, {username}. May your afternoon be filled with accomplishment."
        ],
        Informal: [
            "Hey {username}, good afternoon!",
            "Afternoon, {username}! How's your day going?",
            "Hi there, {username}! Hope you're having a good afternoon!",
            "Good afternoon, {username}! Keep up the good work!",
            "Afternoon, {username}! Time for a coffee break?",
            "Hey {username}, hope your afternoon's going well!",
            "Good afternoon, {username}! Halfway through the day already!",
            "Afternoon, {username}! Don't forget to stretch and hydrate!",
            "Hi {username}, hope you're having a productive afternoon!",
            "Good afternoon, {username}! Keep that energy up!"
        ],
        Humorous: [
            "Good afternoon, {username}! Is it too early for happy hour?",
            "Afternoon, {username}! Time to pretend to look busy!",
            "Hey {username}, good afternoon! Remember, naps are just time travel to dinner.",
            "Good afternoon, {username}! Did you survive the morning?",
            "Afternoon, {username}! If you're reading this, your coffee has worn off.",
            "Hey {username}, it's officially 'why am I so tired?' o'clock!",
            "Good afternoon, {username}! Time to start thinking about what's for dinner.",
            "Afternoon, {username}! Remember, it's all downhill from here... until tomorrow morning.",
            "Hey {username}, good afternoon! May your coffee be strong and your patience stronger.",
            "Good afternoon, {username}! Time to start planning your excuse for leaving early."
        ]
    },
    evening: {
        Formal: [
            "Good evening, {username}. I hope you had a productive day.",
            "Wishing you a pleasant evening, {username}.",
            "Good evening, {username}. May your evening be relaxing and enjoyable.",
            "A formal good evening to you, {username}.",
            "Greetings, {username}. I trust your evening is going well.",
            "Good evening, {username}. I hope this evening brings you relaxation.",
            "Wishing you a peaceful and restful evening, {username}.",
            "Good evening, {username}. May your evening be calm and satisfying.",
            "A cordial good evening to you, {username}.",
            "Greetings and good evening, {username}. May your evening be filled with tranquility."
        ],
        Informal: [
            "Evening, {username}! How was your day?",
            "Hey {username}, good evening!",
            "Hi there, {username}! Hope you're having a nice evening!",
            "Good evening, {username}! Time to relax and unwind!",
            "Evening, {username}! What's on the agenda tonight?",
            "Hey {username}, hope you're enjoying your evening!",
            "Good evening, {username}! Ready to call it a day?",
            "Evening, {username}! Time for some me-time!",
            "Hi {username}, hope you're winding down nicely!",
            "Good evening, {username}! Let's end this day on a high note!"
        ],
        Humorous: [
            "Good evening, {username}! Time to trade your day pants for stretchy pants!",
            "Evening, {username}! Let the Netflix binge begin!",
            "Hey {username}, good evening! Remember, sleep is just a time machine to breakfast.",
            "Good evening, {username}! Did you remember to adult today?",
            "Evening, {username}! Time to start regretting that 3 PM coffee.",
            "Hey {username}, it's officially 'why did I make plans?' o'clock!",
            "Good evening, {username}! Time to start your night shift as a professional couch potato.",
            "Evening, {username}! Remember, tomorrow is another day to pretend you're a functioning adult.",
            "Hey {username}, good evening! May your evening be filled with wine... I mean, relaxation.",
            "Good evening, {username}! Time to start planning your elaborate excuse for tomorrow's lateness."
        ]
    },
    birthday: [
    "Happy Birthday, {username}! Wishing you all the best!",
    "Happy Birthday, {username}! Hope your day is filled with joy!",
    "Happy Birthday, {username}! Enjoy your special day!",
    "Happy Birthday, {username}! Have a fantastic day!",
    "Happy Birthday, {username}! Wishing you a year full of happiness!",
    "Happy Birthday, {username}! Hope all your dreams come true!",
    "Happy Birthday, {username}! Enjoy every moment!",
    "Happy Birthday, {username}! Wishing you a wonderful year ahead!",
    "Happy Birthday, {username}! Have a great celebration!",
    "Happy Birthday, {username}! May your day be as amazing as you are!",
    "Happy Birthday, {username}! Wishing you lots of love and happiness!",
    "Happy Birthday, {username}! Hope you have a blast!",
    "Happy Birthday, {username}! Enjoy your special day to the fullest!",
    "Happy Birthday, {username}! Wishing you a fantastic year ahead!",
    "Happy Birthday, {username}! Hope your day is as wonderful as you!",
    "Happy Birthday, {username}! Celebrate and enjoy your day!",
    "Happy Birthday, {username}! Wishing you all the best on your special day!",
    "Happy Birthday, {username}! Hope your birthday is amazing!",
    "Happy Birthday, {username}! Have an awesome day!",
    "Happy Birthday, {username}! Wishing you a day filled with joy!",
    "Happy Birthday, {username}! Enjoy your special moment!",
    "Happy Birthday, {username}! Have a fabulous day!",
    "Happy Birthday, {username}! Wishing you a lifetime of happiness!",
    "Happy Birthday, {username}! Hope your day is spectacular!",
    "Happy Birthday, {username}! Celebrate your special day!",
    "Happy Birthday, {username}! Have a great birthday!",
    "Happy Birthday, {username}! Wishing you a joyful day!",
    "Happy Birthday, {username}! Enjoy every minute of your special day!",
    "Happy Birthday, {username}! Hope your birthday is unforgettable!",
    "Happy Birthday, {username}! Have a wonderful celebration!"
    ]
};

function createManagerToolBoxUI() {
    settingsContext.events.push({
        start: function (builder) {
            builder.row(function (builder) {
                builder.textInput("Enter your username and birthday (username dd/mm/yyyy)", config.get("userInput", ""), function (value) {
                    config.set("userInput", value, true);
                }).maxLines(1)
                  .singleLine(true);
            });

            var tones = ["Formal", "Informal", "Humorous"];
            var currentTone = config.get("tone", "Informal");
            builder.row(function (builder) {
                var text = builder.text("Tone: " + currentTone);
                builder.slider(0, tones.length - 1, 1, tones.indexOf(currentTone), function (value) {
                    var tone = tones[value];
                    text.label("Tone: " + tone);
                    config.set("tone", tone, true);
                });
            });

            builder.row(function (builder) {
                builder.button("Test Greetings Toast", function () {
                    testGreetingsToast();
                });
            });
        },
    });
}

function getCurrentDateTime() {
    var now = new Date();
    var day = String(now.getDate()).padStart(2, '0');
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var year = now.getFullYear();
    var hours = now.getHours();
    return { day, month, year, hours };
}

function getAge(birthday) {
    var today = new Date();
    var birthDate = new Date(birthday.split('/').reverse().join('-'));
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function isValidDateFormat(dateString) {
    var dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }
    
    var parts = dateString.split('/');
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var year = parseInt(parts[2], 10);
    var date = new Date(year, month, day);
    return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function testGreetingsToast() {
    const userInput = String(config.get("userInput"));
    if (!userInput) {
        longToast("Please enter your username and birthday first.");
        return;
    }

    var [username, userBirthday] = userInput.split(' ');
    if (!username || !userBirthday) {
        longToast("Invalid input format. Please use 'username dd/mm/yyyy'.");
        return;
    }

    if (!isValidDateFormat(userBirthday)) {
        longToast("Invalid date format. Please use dd/mm/yyyy.");
        return;
    }

    displayToast();
}

function displayToast() {
    const userInput = String(config.get("userInput"));
    const { day, month, hours } = getCurrentDateTime();
    const tone = config.get("tone", "Informal");

    var [username, userBirthday] = userInput.split(' ');
    var [bDay, bMonth] = userBirthday.split('/');

    var predefinedPrompt;
    if (day === bDay && month === bMonth) {
        var age = getAge(userBirthday);
        predefinedPrompt = getRandomElement(greetingPresets.birthday).replace('{username}', username) + ` You are ${age} years old today!`;
    } else {
        var timeOfDay;
        if (hours < 12) {
            timeOfDay = "morning";
        } else if (hours < 18) {
            timeOfDay = "afternoon";
        } else {
            timeOfDay = "evening";
        }
        predefinedPrompt = getRandomElement(greetingPresets[timeOfDay][tone]).replace('{username}', username);
    }

    longToast(predefinedPrompt);
}

module.onSnapMainActivityCreate = activity => {
    testGreetingsToast();
};

function createInterface() {
    createManagerToolBoxUI();
}

function start(_) {
    createInterface();
}

start();

im.create("settings" /* EnumUI.SETTINGS */, function (builder, args) {
    settingsContext.events.forEach(function (event) {
        event.start(builder, args);
    });
});
