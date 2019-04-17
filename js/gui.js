// Copyright (c) 2018-2019 Claudio Guarnieri.
//
// This file is part of PhishDetect.
//
// PhishDetect is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// PhishDetect is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with PhishDetect.  If not, see <https://www.gnu.org/licenses/>.

"use strict";

// vex.js is used to create dialogs inside Gmail.
const vex = require("vex-js");
window.vex = vex;
vex.registerPlugin(require("vex-dialog"));
vex.defaultOptions.className = "vex-theme-default";

// generateWebmailWarning is a helper function used to generate the HTML
// needed to show a warning message inside the supported webmails.
window.generateWebmailWarning = function generateWebmailWarning(eventType) {
    var warning = "<div id=\"phishdetect-warning\" class=\"bg-black text-grey-lighter p-4 pt-0 mb-4 rounded-lg tracking-normal\" style=\"padding-top: 1rem;\">";
    warning += "<span class=\"text-lg\"><i class=\"fas fa-exclamation-triangle\"></i> <b>PhishDetect</b> Warning</span><br />";
    warning += "Please be cautious! ";

    if (eventType == "email_sender" || eventType == "email_sender_domain") {
        warning += "The email was sent by a known malicious address. ";
    } else if (eventType == "email_link") {
        warning += "The email contains known malicious links. ";
    }

    warning += "For more information visit our <a class=\"no-underline\" href=\"https://phishdetect.io/help/\"><span class=\"text-blue-light font-bold\">Help</span></a> page.";
    warning += "</div>";

    return warning;
}

window.generateWebmailDialog = function generateWebmailDialog(anchor) {
    var href = anchor.href;

    // We check if it is an http link.
    if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0) {
        return;
    }

    // We delete data-saferedirecturl.
    // Maybe we should make this optional, but the value of it seems
    // mostly duplicated by using phishdetect.io anyway.
    anchor.removeAttribute("data-saferedirecturl");

    // We add a listener so we can catch the clicks.
    anchor.addEventListener("click", function(event) {
        // We prevent the link from opening.
        event.preventDefault();

        // Get URLs.
        // var unsafe_url = event.srcElement.getAttribute("href");
        var unsafe_url = href;
        // Get check URL from config.
        chrome.runtime.sendMessage({method: "getLinkCheckURL"}, function(response) {
            var safe_url = response + window.btoa(unsafe_url);

            // We spawn a dialog.
            vex.defaultOptions.contentClassName = "w-full";
            vex.dialog.open({
                unsafeMessage: "<b>PhishDetect</b><br />How do you want to open this link?",
                buttons: [
                    // Button to open "Safely".
                    $.extend({}, vex.dialog.buttons.YES, {
                        text: "Safely",
                        className: "text-white bg-green",
                        click: function($vexContent, event) {
                            this.value = "safe";
                            this.close();
                            return false;
                        }
                    }),
                    // Button to open "Directly" / "Unsafely".
                    $.extend({}, vex.dialog.buttons.YES, {
                        text: "Directly",
                        className: "text-white bg-red",
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
                            window.open("https://phishdetect.io/help/");
                        }
                    }
                }
            });
        });
    });
}