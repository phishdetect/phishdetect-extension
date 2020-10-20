// Copyright (c) 2018-2020 Claudio Guarnieri.
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

import scanEmail from "./scanEmail.js";

function gmailCheckEmail(uid) {
    console.log("Checking email", uid);

    // Extract the email DOM.
    const email = new gmail.dom.email(uid);
    const emailBody = email.dom("body");
    // Extract from field and prepare hashes.
    const from = email.from();
    const fromEmail = from["email"].toLowerCase();

    return scanEmail(fromEmail, emailBody, uid);
}

// gmailModifyEmail will modify the email body and rewrite links to open our
// confirmation dialog first.
function gmailModifyEmail(id) {
    console.log("Modifying email", id);

    const email = new gmail.dom.email(id);
    const emailBody = email.dom("body");
    const anchors = $(emailBody).find("a");

    chrome.runtime.sendMessage({method: "getNodeEnableAnalysis"}, function(response) {
        for (let i=0; i<anchors.length; i++) {
            if (response === true) {
                // If the configured node supports analysis we show the full dialog.
                generateWebmailDialog(anchors[i]);
            } else {
                // Otherwise we only display a preview of the link.
                generateWebmailPreview(anchors[i]);
            }
        }
    });
}

// gmailReportEmail creates a button to report the currently open email with the
// PhishDetect Node. Reported emails will be marked in the extension's storage
// and we will avoid duplication.
function gmailReportEmail(uid) {
    chrome.runtime.sendMessage({method: "getReportedEmails"}, function(response) {
        let isReported = false;
        for (let i=0; i<response.length; i++) {
            // If the email was already reported before, no need to
            // report it again.
            if (response[i] == uid) {
                isReported = true;
            }
        }

        // Add button to upload email.

        // We delete existing buttons (this normally would happen in the case
        // of Gmail's conversation view).
        // TODO: Review this choice. It might actually not be help and should
        // instead be changed to place the button elsewhere.
        $("[id^='pd-report']").parent().parent().remove();

        let element = $("<div>").get(0);
        generateReportEmailButton(element, {
            uid: uid,
            reported: isReported,
            getEmailPromise: function() {
                return gmail.get.email_source_promise(uid);
            }
        });
        gmail.tools.add_toolbar_button(element);
    });
}

(function() {
    // Check if the option to integrate with webmails is enabled.
    chrome.runtime.sendMessage({method: "getWebmailsIntegration"}, function(response) {
        if (response === false) {
            return;
        }

        console.log("Integrating in Gmail...");

        gmail.observe.on("view_email", function(obj) {
            console.log("Email opened with ID", obj.id);

            // Add report email button.
            gmailReportEmail(obj.id);
            // We check the original content of the email for known indicators.
            gmailCheckEmail(obj.id);
            // We change the email to add our dialog.
            gmailModifyEmail(obj.id);
        });
    });
})();
