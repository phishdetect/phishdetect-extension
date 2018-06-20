"use strict";

const jQuery = require("jquery");
const $ = jQuery;
const GmailFactory = require("gmail-js");
const gmail = new GmailFactory.Gmail($);
window.gmail = gmail;

gmail.observe.on("load", () => {
    const userEmail = gmail.get.user_email();
    console.log("Hello, " + userEmail + ". This is your extension talking!");
});

gmail.observe.on("open_email", function(id, url, body, xhr) {
    var email = new gmail.dom.email(id);
    var emailBody = email.dom("body");
    var anchors = $(emailBody).find("a");

    for (var i=0; i<anchors.length; i++) {
        var href = anchors[i].href;

        // We check if it is an http link.
        if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
            console.log(href);

            // We delete data-saferedirecturl.
            // Maybe we should make this optional, but the value of it seems
            // mostly duplicated by using nophi.sh anyway.
            anchors[i].removeAttribute("data-saferedirecturl");

            // We add a listener so we can catch the clicks.
            anchors[i].addEventListener("click", function(event) {
                // We prevent the link from opening.
                event.preventDefault();

                // Get URLs.
                var unsafe_url = event.srcElement.getAttribute("href");
                var safe_url = BACKEND_URL_CHECK + encodeURIComponent(unsafe_url)

                // We spawn a dialog.
                // Pick the default theme.
                vex.defaultOptions.className = "vex-theme-default";
                // TODO: This is actually not working.
                // vex.defaultOptions.contentClassName = "nophish-dialog-large";
                vex.dialog.open({
                    unsafeMessage: DIALOG_MESSAGE,
                    buttons: [
                        // Button to open "Safely".
                        $.extend({}, vex.dialog.buttons.YES, {
                            text: "Safely",
                            className: "nophish-button-safe",
                            click: function($vexContent, event) {
                                this.value = "safe";
                                this.close();
                                return false;
                            }
                        }),
                        // Button to open "Unsafely".
                        $.extend({}, vex.dialog.buttons.YES, {
                            text: "Unsafely",
                            className: "nophish-button-unsafe",
                            click: function($vexContent, event) {
                                this.value = "unsafe";
                                this.close();
                                return false
                            }
                        }),
                        // Button to open help page.
                        $.extend({}, vex.dialog.buttons.YES, {
                            text: "?",
                            click: function($vexContent, event) {
                                this.value = "help";
                                return false
                            }
                        })
                    ],
                    // Callback to handle button actions.
                    callback: function(value) {
                        if (value) {
                            // Open the URL through our service.
                            if (value == "safe") {
                                window.open(safe_url);
                            // Open the URL directly.
                            } else if (value == "unsafe") {
                                window.open(unsafe_url);
                            } else if (value == "help") {
                                window.open(BACKEND_URL + "help/");
                            }
                        }
                    }
                });
            });
        }
    }
});
