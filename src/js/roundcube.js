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

import checkEmail from './checkEmail.js'

function roundcubeGetOpenEmailUID() {
    var url = new URL(location.href);
    return url.searchParams.get("_uid");
}

function roundcubeGetOpenEmailMailbox() {
    var url = new URL(location.href);
    return url.searchParams.get("_mbox");
}

function roundcubeGetEmailSource() {
    var uid = roundcubeGetOpenEmailUID();
    var mbox = roundcubeGetOpenEmailMailbox();

    var url = (window.location.origin +
               window.location.pathname +
               "?_task=mail&_uid=" + uid +
               "&_mbox=" + mbox +
               "&_action=viewsource&_extwin=1");

    return new Promise(function(resolve, reject) {
        fetch(url)
        .then(function(response) {
            resolve(response.text())
        })
        .catch(error => {
            reject(error);
        })
    });
}

function roundcubeGetEmail() {
    var iframe = $(".iframe.fullheight");
    if (iframe.length) {
        console.log("Found the iframe. This is likely the two panes view.");
        return iframe;
    } else {
        var email = $("#mainscreencontent #mailview-right");
        if (email.length) {
            console.log("Found the full mailview. This is likely the single pane view.");
            return email;
        }
    }

    return null;
}

function roundcubeCheckEmail(email) {
    // Get email body.
    var emailBody = email.find("#messagebody");
    // If there is already a PhishDetect warning, we presume that there is no
    // need to proceed scanning the email.
    var existingWarning = emailBody.find("#phishdetect-warning");
    if (existingWarning.length) {
        return
    }

    // We get the email UID.
    var uid = roundcubeGetOpenEmailUID();
    console.log("Checking email with UID", uid);

    var from = email.find(".rcmContactAddress");
    // If we do not find any sender, we might not have any email open.
    if (from === null || from === undefined) {
        return;
    }

    // Get email sender.
    var fromEmail = from.attr("href").toLowerCase().replace("mailto:", "");

    return checkEmail(fromEmail, emailBody, uid);
}

function roundcubeModifyEmail(email) {
    var emailBody = email.find("#messagebody");
    if (!emailBody.length) {
        return;
    }

    var anchors = emailBody.find("a");

    chrome.runtime.sendMessage({method: "getNodeEnableAnalysis"}, function(response) {
        for (var i=0; i<anchors.length; i++) {
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

function roundcubeReportEmail(email) {
    var uid = roundcubeGetOpenEmailUID();

    chrome.runtime.sendMessage({method: "getReportedEmails"}, function(response) {
        var isReported = false;
        for (var i=0; i<response.length; i++) {
            // If the email was already shared before, no need to
            // report it again.
            if (response[i] == uid) {
                isReported = true;
            }
        }

        var emailHeader = email.find("#messageheader");
        if (!emailHeader.length) {
            return;
        }

        var element = $('<div>').addClass('roundcube').get(0);
        generateReportEmailButton(element, {
            uid: uid,
            reported: isReported,
            getEmailPromise: roundcubeGetEmailSource
        });
        emailHeader.append(element);
    });
}

function roundcube() {
    // NOTE: Currently this is executed inside the main frame as well
    // as the message iframe for the two panes view.
    var email = roundcubeGetEmail();
    if (email === null) {
        return;
    }

    roundcubeReportEmail(email);
    roundcubeCheckEmail(email);
    roundcubeModifyEmail(email);
}
window.roundcube = roundcube;
