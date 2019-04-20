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

// gmail.js
const GmailFactory = require("gmail-js");
const gmail = new GmailFactory.Gmail($);
window.gmail = gmail;

// gmailCheckEmail will try to determine if any element in the email matches a
// known indicator. In order to do so it will try to:
//   1. Check the full email sender among the list of blocklisted email addresses.
//   2. Check the domain of the email sender among the list of blocklisted domains.
//   3. Check all the anchors in the email among the list of blocklisted domains.
// If it matches anything, it will display a warning, highlight any bad link,
// and send an alert through the "sendEvent" message to the background script.
function gmailCheckEmail(id) {
    console.log("Checking email", id)

    // Extract the email DOM.
    var email = new gmail.dom.email(id);
    // Extract from field and prepare hashes.
    var from = email.from();
    var fromEmail = from["email"].toLowerCase();
    var fromEmailHash = sha256(fromEmail);
    var fromEmailDomain = "";
    var fromEmailDomainHash = "";
    var fromEmailTopDomain = "";
    var fromEmailTopDomainHash = "";

    // We extract the domain from the email address.
    var parts = fromEmail.split('@');
    if (parts.length === 2) {
        fromEmailDomain = getDomainFromURL(parts[1]);
        fromEmailDomainHash = sha256(fromEmailDomain);
        fromEmailTopDomain = getTopDomainFromURL(parts[1]);
        fromEmailTopDomainHash = sha256(fromEmailTopDomain);
    }

    console.log("Checking email sender:", fromEmail);

    // First we get the list of indicators.
    chrome.runtime.sendMessage({method: "getIndicators"}, function(response) {
        // Fail if we don't have any indicators.
        if (response == "") {
            return false
        }
        var indicators = response;

        if (indicators === undefined) {
            return false
        }

        // Email status.
        var isEmailBad = false;
        var eventType = "";
        var eventMatch = "";
        var eventIndicator = "";

        // We check for email addresses, if we have any indicators to check.
        if (indicators.emails !== null) {
            var itemsToCheck = [fromEmailHash,];
            var matchedIndicator = checkForIndicators(itemsToCheck, indicators.emails);
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
            var itemsToCheck = [fromEmailDomainHash, fromEmailTopDomainHash];
            var matchedIndicator = checkForIndicators(itemsToCheck, indicators.domains);
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
            var emailBody = email.dom("body");
            var anchors = $(emailBody).find("a");

            // TODO: Might want to reverse these loops for performance reasons.
            for (var i=0; i<anchors.length; i++) {
                // Lowercase the link.
                var href = anchors[i].href.toLowerCase();

                // Only check for HTTP links.
                // NOTE: also scanning for mailto: links (currently experimental).
                if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0 && href.indexOf("mailto:") != 0) {
                    continue;
                }

                console.log("Checking link:", href);

                var hrefDomain = getDomainFromURL(href);
                var hrefDomainHash = sha256(hrefDomain);
                var hrefTopDomain = getTopDomainFromURL(href);
                var hrefTopDomainHash = sha256(hrefTopDomain);

                // We loop through the list of hashed bad domains.
                var elementsToCheck = [hrefDomainHash, hrefTopDomainHash];
                var matchedIndicator = checkForIndicators(elementsToCheck, indicators.domains);
                if (matchedIndicator !== null) {
                    console.log("Detected bad link with indicator:", matchedIndicator);

                    // We add a warning sign to the link.
                    generateWebmailLinkWarning(anchors[i]);

                    // Mark whole email as bad.
                    // TODO: this is ugly.
                    isEmailBad = true;
                    eventType = "email_link";
                    eventMatch = href;
                    eventIndicator = matchedIndicator;

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
            var emailBody = email.dom("body");
            var warning = generateWebmailWarning(eventType);
            emailBody.prepend(warning);
        }
    });
}

// gmailModifyEmail will modify the email body and rewrite links to open our
// confirmation dialog first.
function gmailModifyEmail(id) {
    console.log("Modifying email", id);

    var email = new gmail.dom.email(id);
    var emailBody = email.dom("body");
    var anchors = $(emailBody).find("a");

    for (var i=0; i<anchors.length; i++) {
        generateWebmailDialog(anchors[i]);
    }
}

// gmailShareEmail creates a button to share the currently open email with the
// PhishDetect Node. Shared emails will be marked in the extension's storage
// and we will avoid duplication.
function gmailShareEmail(id) {
    chrome.runtime.sendMessage({method: "getSharedEmails"}, function(response) {
        var is_shared = false;
        for (var i=0; i<response.length; i++) {
            // If the email was already shared before, no need to
            // report it again.
            if (response[i] == id) {
                is_shared = true;
            }
        }

        // Add button to upload email.
        var html_share_button = "<span id=\"pd-share\" class=\"pd-webmail-share\"><i class=\"fas fa-fish\" style=\"color: #3490dc;margin-right: .5rem;\"></i>Share with PhishDetect</span>";
        var html_shared_already = "<span style=\"cursor: pointer;\"><i class=\"fas fa-check-circle\" style=\"color: #38c172;margin-right: .5rem;\"></i>Shared with PhishDetect</span>";

        if (is_shared) {
            gmail.tools.add_toolbar_button(html_shared_already, function() {});
        } else {
            gmail.tools.add_toolbar_button(html_share_button, function() {
                // We ask for confirmation.
                vex.dialog.confirm({
                    unsafeMessage: "<b>PhishDetect</b><br />Are you sure you want to share this email with your PhishDetect Node operator?",
                    callback: function(ok) {
                        if (!ok) {
                            return;
                        }

                        $("#pd-share").html(html_shared_already);

                        var email = new gmail.dom.email(id);
                        chrome.runtime.sendMessage({
                            method: "sendRaw",
                            rawType: "email",
                            rawContent: email.source(),
                            identifier: id,
                        });
                    }
                });
            });
        }
    });
}

(function() {
    // Check if the option to integrate with webmails is enabled.
    chrome.runtime.sendMessage({method: "getWebmails"}, function(response) {
        if (response === false) {
            return;
        }

        gmail.observe.on("view_email", function(obj) {
            console.log("Email opened with ID", obj.id);

            // Add share email button.
            gmailShareEmail(obj.id);
            // We check the original content of the email for known indicators.
            gmailCheckEmail(obj.id);
            // We change the email to add our dialog.
            gmailModifyEmail(obj.id);
        });
    });
})();
