// ==SE_module==
// name: scheduled_messages
// displayName: Scheduled Messages
// description: A Script That Allows For Scheduling Messages and Recurring Messages. Please don't remove Snapchat from the background when your message is scheduled.
// version: 2.6 BETA
// author: ΞTΞRNAL
// credits: rhunk & bocajthomas
// minSEVersion: Versions after 20/08/24
// ==/SE_module==

var messaging = require("messaging");
var im = require("interface-manager");
var config = require("config");

(function () {
  'use strict';

  function getAuthorToastCurrentTime() {
    return new Date().getTime();
  }

  function shouldShowAuthorToast() {
    var currentTime = getAuthorToastCurrentTime();
    var nextAuthorToastTime = config.getLong("nextAuthorToastTime", 0); 

    if (currentTime >= nextAuthorToastTime || nextAuthorToastTime === 0) {
        var oneDayInMillis = 24 * 60 * 60 * 1000;
        config.setLong("nextAuthorToastTime", currentTime + oneDayInMillis, true);
        return true;
    }
    return false;
  }

  function showAuthorStartupToast() {
    if (shouldShowAuthorToast()) {
        shortToast("Made by ΞTΞRNAL");
    }
  }

  var inputMessage = "";
  var customScheduleTime = "";
  var conversationId = null;
  var scheduledMessages = [];
  var recurringMessage = "";
  var recurringInterval = "daily";
  var isRecurringScheduleActive = false;

  var selectedLanguageKey = "selectedLanguage";
  var selectedLanguage = config.get(selectedLanguageKey, 'en');

  var translations = {
    en: {
      enterMessage: "Enter your message",
      customSchedule: "Custom Schedule (DD M YYYY HH MM)",
      recurringMessage: "Recurring Message",
      interval: "Interval",
      schedule1m: "Schedule (1m)",
      schedule5m: "Schedule (5m)",
      schedule30m: "Schedule (30m)",
      schedule1h: "Schedule (1h)",
      customScheduleBtn: "⏰ Custom Schedule",
      cancelAll: "❌",
      startRecurring: "🔁 Recurring Schedule",
      cancelRecurring: "❌",
      pleaseEnterMessage: "Please enter a message",
      pleaseEnterBoth: "Please enter both a message and a custom schedule time",
      allCancelled: "All scheduled messages have been canceled.",
      noScheduled: "No messages currently scheduled.",
      pleaseEnterRecurring: "Please enter a recurring message",
      recurringStarted: "Recurring schedule started: ",
      recurringCancelled: "Recurring schedule cancelled",
      noActiveRecurring: "No active recurring schedule to cancel",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      invalidDateTime: "Invalid date/time format. Please use 'DD M YYYY HH MM'",
      pastDateTime: "The specified time is in the past. Please choose a future time.",
      scheduledFor: "Message scheduled for ",
      attemptingSend: "Attempting to send message: ",
      errorSending: "Error sending message: ",
      messageSent: "Message sent successfully",
      language: "Language"
    },
    pt: {
      enterMessage: "Digite sua mensagem",
      customSchedule: "Agendamento Personalizado (DD M YYYY HH MM)",
      recurringMessage: "Mensagem Recorrente",
      interval: "Intervalo",
      schedule1m: "Agendar (1m)",
      schedule5m: "Agendar (5m)",
      schedule30m: "Agendar (30m)",
      schedule1h: "Agendar (1h)",
      customScheduleBtn: "⏰ Agendamento Personalizado",
      cancelAll: "❌",
      startRecurring: "🔁 Agendar Recorrente",
      cancelRecurring: "❌",
      pleaseEnterMessage: "Por favor, digite uma mensagem",
      pleaseEnterBoth: "Por favor, digite uma mensagem e um horário de agendamento personalizado",
      allCancelled: "Todas as mensagens agendadas foram canceladas.",
      noScheduled: "Não há mensagens agendadas no momento.",
      pleaseEnterRecurring: "Por favor, digite uma mensagem recorrente",
      recurringStarted: "Agendamento recorrente iniciado: ",
      recurringCancelled: "Agendamento recorrente cancelado",
      noActiveRecurring: "Não há agendamento recorrente ativo para cancelar",
      daily: "Diário",
      weekly: "Semanal",
      monthly: "Mensal",
      invalidDateTime: "Formato de data/hora inválido. Use 'DD M YYYY HH MM'",
      pastDateTime: "O horário especificado está no passado. Escolha um horário futuro.",
      scheduledFor: "Mensagem agendada para ",
      attemptingSend: "Tentando enviar mensagem: ",
      errorSending: "Erro ao enviar mensagem: ",
      messageSent: "Mensagem enviada com sucesso",
      language: "Idioma"
    },
    pa: {
      enterMessage: "ਆਪਣਾ ਸੁਨੇਹਾ ਦਰਜ ਕਰੋ",
      customSchedule: "ਕਸਟਮ ਸ਼ੈਡਿਊਲ (DD M YYYY HH MM)",
      recurringMessage: "ਦੁਹਰਾਉਣ ਵਾਲਾ ਸੁਨੇਹਾ",
      interval: "ਅੰਤਰਾਲ",
      schedule1m: "ਸ਼ੈਡਿਊਲ (1ਮਿੰਟ)",
      schedule5m: "ਸ਼ੈਡਿਊਲ (5ਮਿੰਟ)",
      schedule30m: "ਸ਼ੈਡਿਊਲ (30ਮਿੰਟ)",
      schedule1h: "ਸ਼ੈਡਿਊਲ (1ਘੰਟਾ)",
      customScheduleBtn: "⏰ ਕਸਟਮ ਸ਼ੈਡਿਊਲ",
      cancelAll: "❌",
      startRecurring: "🔁 ਦੁਹਰਾਉਣ ਵਾਲਾ ਸ਼ੈਡਿਊਲ",
      cancelRecurring: "❌",
      pleaseEnterMessage: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸੁਨੇਹਾ ਦਰਜ ਕਰੋ",
      pleaseEnterBoth: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸੁਨੇਹਾ ਅਤੇ ਇੱਕ ਕਸਟਮ ਸ਼ੈਡਿਊਲ ਸਮਾਂ ਦਰਜ ਕਰੋ",
      allCancelled: "ਸਾਰੇ ਨਿਰਧਾਰਤ ਸੁਨੇਹੇ ਰੱਦ ਕਰ ਦਿੱਤੇ ਗਏ ਹਨ।",
      noScheduled: "ਇਸ ਸਮੇਂ ਕੋਈ ਸੁਨੇਹੇ ਨਿਰਧਾਰਤ ਨਹੀਂ ਹਨ।",
      pleaseEnterRecurring: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਦੁਹਰਾਉਣ ਵਾਲਾ ਸੁਨੇਹਾ ਦਰਜ ਕਰੋ",
      recurringStarted: "ਦੁਹਰਾਉਣ ਵਾਲਾ ਸ਼ੈਡਿਊਲ ਸ਼ੁਰੂ ਹੋਇਆ: ",
      recurringCancelled: "ਦੁਹਰਾਉਣ ਵਾਲਾ ਸ਼ੈਡਿਊਲ ਰੱਦ ਕੀਤਾ ਗਿਆ",
      noActiveRecurring: "ਰੱਦ ਕਰਨ ਲਈ ਕੋਈ ਸਰਗਰਮ ਦੁਹਰਾਉਣ ਵਾਲਾ ਸ਼ੈਡਿਊਲ ਨਹੀਂ ਹੈ",
      daily: "ਰੋਜ਼ਾਨਾ",
      weekly: "ਹਫਤਾਵਾਰੀ",
      monthly: "ਮਹੀਨਾਵਾਰ",
      invalidDateTime: "ਅਵੈਧ ਮਿਤੀ/ਸਮਾਂ ਫਾਰਮੈਟ। ਕਿਰਪਾ ਕਰਕੇ 'DD M YYYY HH MM' ਵਰਤੋ",
      pastDateTime: "ਨਿਰਧਾਰਤ ਸਮਾਂ ਅਤੀਤ ਵਿੱਚ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਭਵਿੱਖ ਦਾ ਸਮਾਂ ਚੁਣੋ।",
      scheduledFor: "ਸੁਨੇਹਾ ਇਸ ਲਈ ਨਿਰਧਾਰਤ ਕੀਤਾ ਗਿਆ ",
      attemptingSend: "ਸੁਨੇਹਾ ਭੇਜਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰ ਰਿਹਾ ਹੈ: ",
      errorSending: "ਸੁਨੇਹਾ ਭੇਜਣ ਵਿੱਚ ਤਰੁੱਟੀ: ",
      messageSent: "ਸੁਨੇਹਾ ਸਫਲਤਾਪੂਰਵਕ ਭੇਜਿਆ ਗਿਆ",
      language: "ਭਾਸ਼ਾ"
    },
    de: {
      enterMessage: "Geben Sie Ihre Nachricht ein",
      customSchedule: "Benutzerdefinierter Zeitplan (TT M JJJJ HH MM)",
      recurringMessage: "Wiederkehrende Nachricht",
      interval: "Intervall",
      schedule1m: "Planen (1m)",
      schedule5m: "Planen (5m)",
      schedule30m: "Planen (30m)",
      schedule1h: "Planen (1h)",
      customScheduleBtn: "⏰ Benutzerdefinierter Zeitplan",
      cancelAll: "❌",
      startRecurring: "🔁 Wiederkehrend planen",
      cancelRecurring: "❌",
      pleaseEnterMessage: "Bitte geben Sie eine Nachricht ein",
      pleaseEnterBoth: "Bitte geben Sie sowohl eine Nachricht als auch eine benutzerdefinierte Planungszeit ein",
      allCancelled: "Alle geplanten Nachrichten wurden abgebrochen.",
      noScheduled: "Derzeit sind keine Nachrichten geplant.",
      pleaseEnterRecurring: "Bitte geben Sie eine wiederkehrende Nachricht ein",
      recurringStarted: "Wiederkehrender Zeitplan gestartet: ",
      recurringCancelled: "Wiederkehrender Zeitplan abgebrochen",
      noActiveRecurring: "Kein aktiver wiederkehrender Zeitplan zum Abbrechen",
      daily: "Täglich",
      weekly: "Wöchentlich",
      monthly: "Monatlich",
      invalidDateTime: "Ungültiges Datum/Zeitformat. Bitte verwenden Sie 'TT M JJJJ HH MM'",
      pastDateTime: "Der angegebene Zeitpunkt liegt in der Vergangenheit. Bitte wählen Sie einen zukünftigen Zeitpunkt.",
      scheduledFor: "Nachricht geplant für ",
      attemptingSend: "Versuch, Nachricht zu senden: ",
      errorSending: "Fehler beim Senden der Nachricht: ",
      messageSent: "Nachricht erfolgreich gesendet",
      language: "Sprache"
    },
    ru: {
      enterMessage: "Введите ваше сообщение",
      customSchedule: "Пользовательское расписание (ДД М ГГГГ ЧЧ ММ)",
      recurringMessage: "Повторяющееся сообщение",
      interval: "Интервал",
      schedule1m: "Запланировать (1м)",
      schedule5m: "Запланировать (5м)",
      schedule30m: "Запланировать (30м)",
      schedule1h: "Запланировать (1ч)",
      customScheduleBtn: "⏰ Пользовательское расписание",
      cancelAll: "❌",
      startRecurring: "🔁 Запланировать повторяющееся",
      cancelRecurring: "❌",
      pleaseEnterMessage: "Пожалуйста, введите сообщение",
      pleaseEnterBoth: "Пожалуйста, введите как сообщение, так и пользовательское время планирования",
      allCancelled: "Все запланированные сообщения были отменены.",
      noScheduled: "В настоящее время нет запланированных сообщений.",
      pleaseEnterRecurring: "Пожалуйста, введите повторяющееся сообщение",
      recurringStarted: "Повторяющееся расписание начато: ",
      recurringCancelled: "Повторяющееся расписание отменено",
      noActiveRecurring: "Нет активного повторяющегося расписания для отмены",
      daily: "Ежедневно",
      weekly: "Еженедельно",
      monthly: "Ежемесячно",
      invalidDateTime: "Неверный формат даты/времени. Пожалуйста, используйте 'ДД М ГГГГ ЧЧ ММ'",
      pastDateTime: "Указанное время в прошлом. Пожалуйста, выберите будущее время.",
      scheduledFor: "Сообщение запланировано на ",
      attemptingSend: "Попытка отправить сообщение: ",
      errorSending: "Ошибка при отправке сообщения: ",
      messageSent: "Сообщение успешно отправлено",
      language: "Язык"
    },
    ar: {
      enterMessage: "أدخل رسالتك",
      customSchedule: "جدول مخصص (DD M YYYY HH MM)",
      recurringMessage: "رسالة متكررة",
      interval: "الفاصل الزمني",
      schedule1m: "جدولة (1د)",
      schedule5m: "جدولة (5د)",
      schedule30m: "جدولة (30د)",
      schedule1h: "جدولة (1س)",
      customScheduleBtn: "⏰ جدول مخصص",
      cancelAll: "❌",
      startRecurring: "🔁 جدولة متكررة",
      cancelRecurring: "❌",
      pleaseEnterMessage: "الرجاء إدخال رسالة",
      pleaseEnterBoth: "الرجاء إدخال كل من الرسالة ووقت الجدولة المخصص",
      allCancelled: "تم إلغاء جميع الرسائل المجدولة.",
      noScheduled: "لا توجد رسائل مجدولة حاليًا.",
      pleaseEnterRecurring: "الرجاء إدخال رسالة متكررة",
      recurringStarted: "بدأ الجدول المتكرر: ",
      recurringCancelled: "تم إلغاء الجدول المتكرر",
      noActiveRecurring: "لا يوجد جدول متكرر نشط للإلغاء",
      daily: "يومي",
      weekly: "أسبوعي",
      monthly: "شهري",
      invalidDateTime: "تنسيق تاريخ/وقت غير صالح. الرجاء استخدام 'DD M YYYY HH MM'",
      pastDateTime: "الوقت المحدد في الماضي. الرجاء اختيار وقت مستقبلي.",
      scheduledFor: "تم جدولة الرسالة لـ ",
      attemptingSend: "محاولة إرسال الرسالة: ",
      errorSending: "خطأ في إرسال الرسالة: ",
      messageSent: "تم إرسال الرسالة بنجاح",
      language: "اللغة"
    },
    fr: {
      enterMessage: "Entrez votre message",
      customSchedule: "Planification personnalisée (JJ M AAAA HH MM)",
      recurringMessage: "Message récurrent",
      interval: "Intervalle",
      schedule1m: "Planifier (1m)",
      schedule5m: "Planifier (5m)",
      schedule30m: "Planifier (30m)",
      schedule1h: "Planifier (1h)",
      customScheduleBtn: "⏰ Planification personnalisée",
      cancelAll: "❌",
      startRecurring: "🔁 Planifier récurrent",
      cancelRecurring: "❌",
      pleaseEnterMessage: "Veuillez entrer un message",
      pleaseEnterBoth: "Veuillez entrer à la fois un message et une heure de planification personnalisée",
      allCancelled: "Tous les messages planifiés ont été annulés.",
      noScheduled: "Aucun message n'est actuellement planifié.",
      pleaseEnterRecurring: "Veuillez entrer un message récurrent",
      recurringStarted: "Planification récurrente commencée : ",
      recurringCancelled: "Planification récurrente annulée",
      noActiveRecurring: "Aucune planification récurrente active à annuler",
      daily: "Quotidien",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      invalidDateTime: "Format de date/heure invalide. Veuillez utiliser 'JJ M AAAA HH MM'",
      pastDateTime: "L'heure spécifiée est dans le passé. Veuillez choisir une heure future.",
      scheduledFor: "Message planifié pour ",
      attemptingSend: "Tentative d'envoi du message : ",
      errorSending: "Erreur lors de l'envoi du message : ",
      messageSent: "Message envoyé avec succès",
      language: "Langue"
    }
  };

  function t(key) {
    return translations[selectedLanguage][key] || translations['en'][key];
  }

  function displayMessage(message) {
    console.log(message);
    if (typeof shortToast === "function") {
      shortToast(message);
    } else {
      console.warn("shortToast is not available. Message:", message);
    }
  }

  function sendMessage(conversationId, message) {
    displayMessage(t("attemptingSend") + message);

    if (typeof messaging.sendChatMessage !== "function") {
      displayMessage(t("errorSending") + "messaging.sendChatMessage is not a function");
      return;
    }

    try {
      messaging.sendChatMessage(conversationId, message, function (error) {
        if (error) {
          displayMessage(t("errorSending") + JSON.stringify(error));
        } else {
          displayMessage(t("messageSent"));
        }
      });
    } catch (error) {
      displayMessage(t("errorSending") + JSON.stringify(error));
    }
  }

  function scheduleMessage(message, durationInMs) {
    var scheduledTime = Date.now() + durationInMs;
    scheduledMessages.push({ message: message, time: scheduledTime });
    displayMessage(t("scheduledFor") + new Date(scheduledTime).toString());

    setTimeout(function() {
      sendScheduledMessage(scheduledTime);
    }, durationInMs);
  }

  function scheduleCustomMessage(message, dateTimeString) {
    var parts = dateTimeString.split(" ");
    if (parts.length !== 5) {
      displayMessage(t("invalidDateTime"));
      return;
    }

    var targetDate = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
    var now = new Date();
    var timeUntilSend = targetDate.getTime() - now.getTime();

    if (timeUntilSend <= 0) {
      displayMessage(t("pastDateTime"));
      return;
    }

    scheduledMessages.push({ message: message, time: targetDate.getTime() });
    displayMessage(t("scheduledFor") + targetDate.toString());

    setTimeout(function() {
      sendScheduledMessage(targetDate.getTime());
    }, timeUntilSend);
  }

  function sendScheduledMessage(scheduledTime) {
    var index = scheduledMessages.findIndex(msg => msg.time === scheduledTime);
    if (index !== -1) {
      var scheduledMsg = scheduledMessages[index];
      sendMessage(conversationId, scheduledMsg.message);
      scheduledMessages.splice(index, 1);
    }
  }

  function startRecurringSchedule() {
    isRecurringScheduleActive = true;
    config.set("conversationId", conversationId, true);
    config.setBoolean("isRecurringScheduleActive", true, true);
    config.set("recurringMessage", recurringMessage, true);
    config.set("recurringInterval", recurringInterval, true);
    config.setLong("nextRecurringTime", calculateNextRecurringTime(), true);
    displayMessage(t("recurringStarted") + recurringInterval);
  }

  function cancelRecurringSchedule() {
    if (isRecurringScheduleActive) {
      isRecurringScheduleActive = false;
      config.setBoolean("isRecurringScheduleActive", false, true);
      config.set("recurringMessage", "", true);
      config.set("recurringInterval", "daily", true);
      config.setLong("nextRecurringTime", 0, true);
      displayMessage(t("recurringCancelled"));
    } else {
      displayMessage(t("noActiveRecurring"));
    }
  }

  function calculateNextRecurringTime() {
    var now = new Date();
    var next = new Date(now);
    switch(recurringInterval) {
    case "daily":
      next.setDate(now.getDate() + 1);
      break;
    case "weekly":
      next.setDate(now.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(now.getMonth() + 1);
      break;
  }
    return next.getTime();
  }

  function checkAndSendRecurringMessage() {
    if (isRecurringScheduleActive) {
      var currentTime = Date.now();
      var nextRecurringTime = config.getLong("nextRecurringTime", 0);

      console.log("Current time:", new Date(currentTime).toString());
      console.log("Next recurring time:", new Date(nextRecurringTime).toString());

      if (currentTime >= nextRecurringTime) {
        conversationId = config.get("conversationId");
        if (conversationId) {
          sendMessage(conversationId, config.get("recurringMessage", ""));
        
          var newNextRecurringTime = calculateNextRecurringTime();
          config.setLong("nextRecurringTime", newNextRecurringTime, true);
        
          console.log("Message sent. New next recurring time:", new Date(newNextRecurringTime).toString());
        } else {
          console.error("Error: conversationId not found for recurring message.");
      }
    } else {
        console.log("Not yet time to send recurring message.");
    }
  } else {
      console.log("Recurring schedule is not active.");
  }
}

  function createConversationToolboxUI() {
    im.create("conversationToolbox", function (builder, args) {
      try {
        conversationId = args["conversationId"];

        builder.textInput(t("enterMessage"), "", function (value) {
          inputMessage = value;
        }).singleLine(true);

        builder.row(function(rowBuilder) {
          rowBuilder.button(t("schedule1m"), function() {
            if (inputMessage.trim() !== "") {
              scheduleMessage(inputMessage, 60000);
            } else {
              displayMessage(t("pleaseEnterMessage"));
            }
          });

          rowBuilder.text(" ");

          rowBuilder.button(t("schedule5m"), function() {
            if (inputMessage.trim() !== "") {
              scheduleMessage(inputMessage, 300000);
            } else {
              displayMessage(t("pleaseEnterMessage"));
            }
          });
        });

        builder.row(function(rowBuilder) {
          rowBuilder.button(t("schedule30m"), function() {
            if (inputMessage.trim() !== "") {
              scheduleMessage(inputMessage, 1800000);
            } else {
              displayMessage(t("pleaseEnterMessage"));
            }
          });

          rowBuilder.text(" ");

          rowBuilder.button(t("schedule1h"), function() {
            if (inputMessage.trim() !== "") {
              scheduleMessage(inputMessage, 3600000);
            } else {
              displayMessage(t("pleaseEnterMessage"));
            }
          });
        });

        builder.textInput(t("customSchedule"), "", function (value) {
          customScheduleTime = value;
        }).singleLine(true);

        builder.row(function(rowBuilder) {
          rowBuilder.button(t("customScheduleBtn"), function() {
            if (inputMessage.trim() !== "" && customScheduleTime.trim() !== "") {
              scheduleCustomMessage(inputMessage, customScheduleTime);
            } else {
              displayMessage(t("pleaseEnterBoth"));
            }
          });

          rowBuilder.text(" ");

          rowBuilder.button(t("cancelAll"), function() {
            if (scheduledMessages.length > 0) {
              scheduledMessages = [];
              displayMessage(t("allCancelled"));
            } else {
              displayMessage(t("noScheduled"));
            }
          });
        });

        builder.textInput(t("recurringMessage"), "", function (value) {
          recurringMessage = value;
        }).singleLine(true);

        var intervals = [t("daily"), t("weekly"), t("monthly")];
        var intervalIndex = recurringInterval === "daily" ? 0 : (recurringInterval === "weekly" ? 1 : 2);

        builder.row(function(rowBuilder) {
          var intervalText = rowBuilder.text(t("interval") + ": " + intervals[intervalIndex]);
          rowBuilder.slider(0, 2, 3, intervalIndex, function(value) {
            switch(value) {
              case 0:
                recurringInterval = "daily";
                break;
              case 1:
                recurringInterval = "weekly";
                break;
              case 2:
                recurringInterval = "monthly";
                break;
            }
            intervalText.label(t("interval") + ": " + intervals[value]);
          });
        })
        .arrangement("spaceBetween")
        .fillMaxWidth()
        .padding(4);

        builder.row(function(rowBuilder) {
          rowBuilder.button(t("startRecurring"), function() {
            if (recurringMessage.trim() !== "") {
              startRecurringSchedule();
            } else {
              displayMessage(t("pleaseEnterRecurring"));
            }
          });

          rowBuilder.text(" ");

          rowBuilder.button(t("cancelRecurring"), function() {
            cancelRecurringSchedule();
          });
        });

        var languages = ["English", "Portuguese", "Punjabi", "German", "Russian", "Arabic", "French"];
        var languageCodes = ['en', 'pt', 'pa', 'de', 'ru', 'ar', 'fr'];
        var oldSelectedLanguage = config.get(selectedLanguageKey, 'en');
        var oldSelectedIndex = languageCodes.indexOf(oldSelectedLanguage);

        builder.row(function (builder) {
          var text = builder.text(t("language") + ": " + languages[oldSelectedIndex]);
          builder.slider(0, languages.length - 1, languages.length - 1, oldSelectedIndex, function (value) {
            var newLanguage = languageCodes[value];
            text.label(t("language") + ": " + languages[value]);
            config.set(selectedLanguageKey, newLanguage, true);
            selectedLanguage = newLanguage;
            createConversationToolboxUI();
          });
        })
        .arrangement("spaceBetween")
        .fillMaxWidth()
        .padding(4);

      } catch (error) {
        console.error("Error in createConversationToolboxUI: " + JSON.stringify(error));
      }
    });
  }

  function start() {
    createConversationToolboxUI();
  }

  start();

  module.onSnapMainActivityCreate = activity => {
    showAuthorStartupToast();
    isRecurringScheduleActive = config.getBoolean("isRecurringScheduleActive", false);
    recurringMessage = config.get("recurringMessage", "");
    recurringInterval = config.get("recurringInterval", "daily");

    checkAndSendRecurringMessage();
  };

})();
