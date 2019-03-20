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

// This is a helper function to check hashes against the list of
// malicious indicators.
function isElementInIndicators(element1, element2, indicators) {
    for (let i=0; i<indicators.length; i++) {
        let indicator = indicators[i].toLowerCase();
        if (indicator == element1 || indicator == element2) {
            return indicator;
        }
    }

    return null;
}

// checkEmail will try to determine if any element in the email matches a
// known indicator. In order to do so it will try to:
//   1. Check the full email sender among the list of blocklisted email addresses.
//   2. Check the domain of the email sender among the list of blocklisted domains.
//   3. Check all the anchors in the email among the list of blocklisted domains.
// If it matches anything, it will display a warning, highlight any bad link,
// and send an alert through the "sendEvent" message to the background script.
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

    // We extract the domain from the email address.
    let parts = fromEmail.split('@');
    if (parts.length === 2) {
        let parsed = tldts.parse(parts[1]);
        fromEmailDomain = parsed.host;
        fromEmailDomainHash = sha256(fromEmailDomain);
        fromEmailTopDomain = parsed.domain;
        fromEmailTopDomainHash = sha256(fromEmailTopDomain);
    }

    console.log("Checking email sender:", fromEmail);

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
            let matchedIndicator = isElementInIndicators(fromEmailHash, "", indicators.emails);
            if (matchedIndicator !== null) {
                console.log("Detected bad email sender with indicator:", matchedIndicator);

                // Mark email as bad.
                isEmailBad = true;
                eventType = "email_sender";
                eventMatch = fromEmail;
                eventIndicator = matchedIndicator;
            }
        }

        // TODO: Need to review the performance of this.
        // We check for domains, if we have any indicators to check.
        if (indicators.domains !== null) {
            // First we check the domain of the email sender.
            let matchedIndicator = isElementInIndicators(fromEmailDomainHash, fromEmailTopDomainHash, indicators.domains);
            if (matchedIndicator !== null) {
                console.log("Detected email sender domain with indicator:", matchedIndicator);

                // Mark whole email as bad.
                // TODO: this is ugly.
                isEmailBad = true;
                eventType = "email_sender_domain";
                eventMatch = fromEmail;
                eventIndicator = matchedIndicator;
            }

            // Now we check for links contained in the emails body.
            // We extract all links from the body of the email.
            let emailBody = email.dom("body");
            let anchors = $(emailBody).find("a");

            // TODO: Might want to reverse these loops for performance reasons.
            for (let i=0; i<anchors.length; i++) {
                // Lowercase the link.
                let href = anchors[i].href.toLowerCase();

                // Only check for HTTP links.
                // NOTE: also scanning for mailto: links (currently experimental).
                if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0 && href.indexOf("mailto:") != 0) {
                    continue;
                }

                console.log("Checking link:", href);

                let parsed = tldts.parse(href);
                let hrefDomain = parsed.host;
                let hrefDomainHash = sha256(hrefDomain);
                let hrefTopDomain = parsed.domain;
                let hrefTopDomainHash = sha256(parsed.domain);

                // We loop through the list of hashed bad domains.
                let matchedIndicator = isElementInIndicators(hrefDomainHash, hrefTopDomainHash, indicators.domains);
                if (matchedIndicator !== null) {
                    console.log("Detected bad link with indicator:", matchedIndicator);

                    // Mark whole email as bad.
                    // TODO: this is ugly.
                    isEmailBad = true;
                    eventType = "email_link";
                    eventMatch = href;
                    eventIndicator = matchedIndicator;

                    // TODO: Need to make this a lot better.
                    let span = document.createElement("span");
                    span.innerHTML = " <i class=\"fas fa-exclamation-triangle\"></i>";
                    span.classList.add("text-red");
                    span.setAttribute("title", "PhishDetect Warning: this link is malicious!");
                    anchors[i].parentNode.insertBefore(span, anchors[i].nextSibling);

                    break;
                }
            }
        }

        // TODO: this is ugly.
        // If there is any malicious element we proceed with notifications.
        if (isEmailBad === true) {
            // First we send an "event" to the PhishDetect Node through the "sendEvent"
            // message to the background script. This will proceed only if the
            // appropriate settings option is enabled.
            chrome.runtime.sendMessage({
                method: "sendEvent",
                eventType: eventType,
                match: eventMatch,
                indicator: eventIndicator,
                identifier: id,
            });

            // Then we display a warning to the user inside the Gmail web interface.
            let emailBody = email.dom("body");
            let warning = "<div class=\"bg-black text-grey-lighter p-4 mb-4 rounded-lg tracking-normal\">"
            warning += "<span class=\"text-lg\"><i class=\"fas fa-exclamation-triangle\"></i> <b>PhishDetect</b> Warning</span><br />"
            warning += "Please be cautious! "

            if (eventType == "email_sender" || eventType == "email_sender_domain") {
                warning += "The email was sent by a known malicious address. "
            } else if (eventType == "email_link") {
                warning += "The email contains known malicious links. "
            }

            warning += "For more information visit our <a class=\"no-underline\" href=\"https://phishdetect.io/help/\"><span class=\"text-blue-light font-bold\">Help</span></a> page."
            warning += "</div>"
            emailBody.prepend(warning);
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
            chrome.runtime.sendMessage({method: "getLinkCheckURL"}, function(response) {
                let safe_url = response + window.btoa(unsafe_url);

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
}

// shareEmail creates a button to share the currently open email with the
// PhishDetect Node. Shared emails will be marked in the extension's storage
// and we will avoid duplication.
function shareEmail(id) {
    chrome.runtime.sendMessage({method: "getSharedEmails"}, function(response) {
        let is_shared = false;
        for (let i=0; i<response.length; i++) {
            // If the email was already shared before, no need to
            // report it again.
            if (response[i] == id) {
                is_shared = true;
            }
        }

        // Add button to upload email.
        let html_share_button = "<span id=\"pd_share\" class=\"p-2 rounded-lg hover:bg-grey-lighter\"><i class=\"fas fa-fish text-blue mr-2\"></i>Share with PhishDetect</span>";
        let html_shared_already = "<span class=\"cursor-pointer\"><i class=\"fas fa-check-circle text-green mr-2\"></i>Shared with PhishDetect</span>";

        if (is_shared) {
            gmail.tools.add_toolbar_button(html_shared_already, function() {});
        } else {
            gmail.tools.add_toolbar_button(html_share_button, function() {
                document.getElementById("pd_share").innerHTML = html_shared_already;

                let email = new gmail.dom.email(id);
                chrome.runtime.sendMessage({
                    method: "sendRaw",
                    rawType: "email",
                    rawContent: email.source(),
                    identifier: id,
                });
            });
        }
    });
}

chrome.runtime.sendMessage({method: "getGmail"}, function(response) {
    if (response === false) {
        return;
    }

    gmail.observe.on("view_email", function(obj) {
        console.log("Email opened with ID", obj.id);

        // Add share email button.
        shareEmail(obj.id);
        // We check the original content of the email for known indicators.
        checkEmail(obj.id);
        // We change the email to add our dialog.
        modifyEmail(obj.id);
    });
});
