// Copyright (c) 2018 Claudio Guarnieri.
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

const jQuery = require("jquery");
const $ = jQuery;

const vex = require("vex-js");
window.vex = vex;
vex.registerPlugin(require("vex-dialog"));
vex.defaultOptions.className = "vex-theme-default";

const GmailFactory = require("gmail-js");
const gmail = new GmailFactory.Gmail($);
window.gmail = gmail;

const tldts = require("tldts");
window.tldts = tldts;

// checkEmail
function checkEmail(id) {
    console.log("Checking email", id)

    let email = new gmail.dom.email(id);
    let from = email.from();
    let fromEmail = from["email"].toLowerCase()
    let fromEmailHash = sha256(fromEmail);
    let fromEmailDomain = "";
    let fromEmailDomainHash = "";
    let fromEmailTopDomain = "";
    let fromEmailTopDomainHash = "";

    console.log("All good so far");
    // We extract the domain from the email address.
    let parts = fromEmail.split('@');
    if (parts.length === 2) {
        let parsed = tldts.parse(parts[1]);
        fromEmailDomain = parsed.host;
        fromEmailDomainHash = sha256(fromEmailDomain);
        fromEmailTopDomain = parsed.domain;
        fromEmailTopDomainHash = sha256(fromEmailTopDomain);
    }

    console.log("Sender is:", fromEmail);
    console.log("Sender hash is:", fromEmailHash);
    console.log("Sender domain is:", fromEmailDomain);
    console.log("Sender domain hash is:", fromEmailDomainHash);
    console.log("Sender top domain is:", fromEmailTopDomain);
    console.log("Sender top domain hash is:", fromEmailTopDomainHash);

    // First we get the list of indicators.
    chrome.runtime.sendMessage({method: "getIndicators"}, function(response) {
        // Fail if we don't have any indicators.
        if (response == "") {
            return false
        }
        let indicators = response;

        if (indicators === undefined) {
            return false
        }

        // Email status.
        let isEmailBad = false;
        let eventType = "";
        let eventMatch = "";
        let eventIndicator = "";

        // We check for email addresses, if we have any indicators to check.
        if (indicators.emails !== null) {
            // We loop through the list of hashed bad email addresses.
            for (let i=0; i<indicators.emails.length; i++) {
                let badSender = indicators.emails[i].toLowerCase();
                // We check if the email sender matches a bad address.
                if (badSender == fromEmailHash) {
                    // Mark email as bad.
                    isEmailBad = true;
                    eventType = "email_sender";
                    eventMatch = fromEmail;
                    eventIndicator = badSender;

                    break;
                }
            }
        }

        // TODO: Need to review the performance of this.
        // We check for domains, if we have any indicators to check.
        if (indicators.domains !== null) {
            // First we check the domain of the email sender.
            for (let i=0; i<indicators.domains.length; i++) {
                let badDomainHash = indicators.domains[i].toLowerCase();

                // Check if the domain is bad.
                if (badDomainHash == fromEmailDomainHash || badDomainHash == fromEmailTopDomainHash) {
                    // Mark whole email as bad.
                    // TODO: this is ugly.
                    isEmailBad = true;
                    eventType = "email_sender_domain";
                    eventMatch = fromEmail;
                    eventIndicator = badDomainHash;

                    break;
                }
            }

            // Now we check for links contained in the emails body.
            // We extract all links from the body of the email.
            let emailBody = email.dom("body");
            let anchors = $(emailBody).find("a");

            // TODO: Might want to reverse these loops for performance reasons.
            for (let i=0; i<anchors.length; i++) {
                let href = anchors[i].href;

                // Only check for HTTP links.
                if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0) {
                    continue;
                }

                let hrefParsed = tldts.parse(href);
                let domainHash = sha256(hrefParsed.host);
                let topDomainHash = sha256(hrefParsed.domain);

                // We loop through the list of hashed bad domains.
                for (let i=0; i<indicators.domains.length; i++) {
                    let badDomainHash = indicators.domains[i].toLowerCase();

                    // Check if the domain is bad.
                    if (badDomainHash == domainHash || badDomainHash == topDomainHash) {
                        // Mark whole email as bad.
                        // TODO: this is ugly.
                        isEmailBad = true;
                        eventType = "email_link";
                        eventMatch = href;
                        eventIndicator = badDomainHash;

                        // TODO: how to make this less aggressive?
                        let alert = document.createElement("span");
                        alert.classList.add("bg-red-lighter");
                        alert.innerHTML = "<b>PhishDetect</b>: I disabled this link because it is malicious!";                        
                        anchors[i].parentNode.replaceChild(alert, anchors[i]);

                        break;
                    }
                }
            }
        }

        if (isEmailBad === true) {
            chrome.runtime.sendMessage({
                method: "sendEvent",
                eventType: eventType,
                match: eventMatch,
                indicator: eventIndicator,
                // TODO: Add gmail.get.user_email()?
                userContact: "",
            });

            vex.dialog.open({
                unsafeMessage: "<b>PhishDetect</b><br />I found malicious elements in this email!",
            });
        }
    });
}

// modifyEmail will modify the email body and rewrite links to open our
// confirmation dialog first.
function modifyEmail(id) {
    console.log("Modifying email", id);

    let email = new gmail.dom.email(id);
    let emailBody = email.dom("body");
    let anchors = $(emailBody).find("a");

    for (let i=0; i<anchors.length; i++) {
        let href = anchors[i].href;

        // We check if it is an http link.
        if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0) {
            continue;
        }

        // We delete data-saferedirecturl.
        // Maybe we should make this optional, but the value of it seems
        // mostly duplicated by using phishdetect.io anyway.
        anchors[i].removeAttribute("data-saferedirecturl");

        // We add a listener so we can catch the clicks.
        anchors[i].addEventListener("click", function(event) {
            // We prevent the link from opening.
            event.preventDefault();

            // Get URLs.
            // let unsafe_url = event.srcElement.getAttribute("href");
            let unsafe_url = href;
            // Get check URL from config.
            chrome.runtime.sendMessage({method: "getCheckURL"}, function(response) {
                let safe_url = response + window.btoa(unsafe_url);

                // We spawn a dialog.
                vex.defaultOptions.contentClassName = "w-full";
                vex.dialog.open({
                    unsafeMessage: "<b>PhishDetect</b><br />How do you want to open this link?",
                    buttons: [
                        // Button to open "Safely".
                        $.extend({}, vex.dialog.buttons.YES, {
                            text: "Safely",
                            // className: "phishdetect-button-safe",
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
}

// NOTE: Currently disabled this event as we don't need the user email atm.
//gmail.observe.on("load", () => {
//    const userEmail = gmail.get.user_email();
//    console.log("Hello, " + userEmail + ". This is your extension talking!");
//});

// We only observe this to activate view_email.
// gmail.observe.on("view_thread", function(obj) {
//     console.log("Thread opened with ID", obj.id);
// });

// This is the event we watch to be able to modify the links in the body.
chrome.runtime.sendMessage({method: "getGmail"}, function(response) {
    if (response === false) {
        return;
    }
    gmail.observe.on("view_email", function(obj) {
        console.log("Email opened with ID", obj.id);
        // First we check the original content of the email for known indicators.
        checkEmail(obj.id);
        // Afterwards, we change the email to add our dialog.
        modifyEmail(obj.id);
    });
});
