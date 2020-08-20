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

import scanEmail from "./scanEmail.js";

// Get the email ID from the URL.
function roundcubeGetOpenEmailUID() {
    const url = new URL(location.href);
    return url.searchParams.get("_uid");
}

// Get mbox ID from the URL.
function roundcubeGetOpenEmailMailbox() {
    const url = new URL(location.href);
    return url.searchParams.get("_mbox");
}

// Get the email source by invoking Roundcube's "viewsource" view.
function roundcubeGetEmailSource() {
    const uid = roundcubeGetOpenEmailUID();
    const mbox = roundcubeGetOpenEmailMailbox();

    const url = (window.location.origin +
                 window.location.pathname +
                 "?_task=mail&_uid=" + uid +
                 "&_mbox=" + mbox +
                 "&_action=viewsource&_extwin=1");

    return new Promise(function(resolve, reject) {
        fetch(url)
        .then(function(response) {
            resolve(response.text());
        })
        .catch(error => {
            reject(error);
        })
    });
}

// Try to detect and retrieve the DOM object containing the email.
function roundcubeGetEmail(version) {
    if (version == "larry") {
        console.log("[PhishDetect] Looking for email in Rouncube Larry template...");

        const iframe = $(".iframe.fullheight");
        if (iframe.length) {
            console.log("[PhishDetect] Found the iframe. This is likely the two panes view.");
            return iframe;
        }

        const email = $("#mainscreencontent #mailview-right");
        if (email.length) {
            console.log("[PhishDetect] Found the full mailview. This is likely the single pane view.");
            return email;
        }
    } else if (version == "elastic") {
        console.log("[PhishDetect] Looking for email in Rouncube Elastic template...");

        const iframe = $(".task-mail");
        if (iframe.length) {
            console.log("[PhishDetect] Found the iframe. This is likely the two panes view.");
            return iframe;
        }

        const email = $(".content.frame-content");
        if (email.length) {
            console.log("[PhishDetect] Found the full mailview. This is likely the single pane view.");
            return email;
        }
    }

    console.log("[PhishDetect] No email view found.");

    return null;
}

// Extract email sender and body and launch a scan.
function roundcubeCheckEmail(email) {
    // Get email body.
    const emailBody = email.find("#messagebody");

    // If there is already a PhishDetect warning, we presume that there is no
    // need to proceed scanning the email.
    const existingWarning = emailBody.find("#phishdetect-warning");
    if (existingWarning.length) {
        return
    }

    // We get the email UID.
    const uid = roundcubeGetOpenEmailUID();
    // If the ID is null, we stop.
    if (uid === null) {
        return;
    }

    console.log("[PhishDetect] Checking email with UID", uid);

    // Get the email sender.
    var from = email.find(".rcmContactAddress");

    // If we do not find any sender, we might not have any email open.
    if (from === null || from === undefined) {
        return;
    }

    // Get email sender.
    const fromEmail = from.attr("href").toLowerCase().replace("mailto:", "");

    return scanEmail(fromEmail, emailBody, uid);
}

// Modify the email to add PhishDetect's prompts.
function roundcubeModifyEmail(email) {
    const emailBody = email.find("#messagebody");
    if (!emailBody.length) {
        return;
    }

    var anchors = emailBody.find("a");

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

// Add button to report email to the Node.
function roundcubeReportEmail(email, version) {
    const uid = roundcubeGetOpenEmailUID();

    chrome.runtime.sendMessage({method: "getReportedEmails"}, function(response) {
        let isReported = false;
        for (let i=0; i<response.length; i++) {
            // If the email was already shared before, no need to
            // report it again.
            if (response[i] == uid) {
                isReported = true;
            }
        }

        let emailHeader;
        if (version == "larry") {
            emailHeader = email.find("#messageheader");
        } else if (version == "elastic") {
            emailHeader = email.find("#message-header");
        }
        if (!emailHeader.length) {
            return;
        }

        let element = $("<div>").addClass("roundcube").get(0);
        generateReportEmailButton(element, {
            uid: uid,
            reported: isReported,
            getEmailPromise: roundcubeGetEmailSource
        });
        emailHeader.append(element);
    });
}

window.roundcube = function roundcube(version) {
    // NOTE: Currently this is executed inside the main frame as well
    // as the message iframe for the two panes view.
    var email = roundcubeGetEmail(version);
    if (email === null) {
        return;
    }

    roundcubeReportEmail(email, version);
    roundcubeCheckEmail(email);
    roundcubeModifyEmail(email);
}
