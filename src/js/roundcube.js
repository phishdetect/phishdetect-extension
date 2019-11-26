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
    console.log("Checking email sender: " + fromEmail);

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

    // First we get the list of indicators.
    chrome.runtime.sendMessage({method: "getIndicators"}, function(response) {
        // Fail if we don't have any indicators.
        if (response == "") {
            return false;
        }
        var indicators = response;

        if (indicators === undefined) {
            return false;
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

        if (indicators.domains !== null) {
            // First we check the domain of the email sender.
            var itemsToCheck = [fromEmailDomainHash, fromEmailTopDomainHash];
            var matchedIndicator = checkForIndicators(itemsToCheck, indicators.domains);
            if (matchedIndicator !== null) {
                console.log("Detected email sender domain with indicator:", matchedIndicator);

                isEmailBad = true;
                eventType = "email_sender_domain";
                eventMatch = fromEmail;
                eventIndicator = matchedIndicator;
            }

            // Now we check for links in the email body.
            var anchors = emailBody.find("a");

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
                identifier: uid,
            });

            // Then we display a warning to the user inside the Gmail web interface.
            var warning = generateWebmailWarning(eventType);
            emailBody.prepend(warning);
        }
    });
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

        var htmlReportedAlready = $.parseHTML(generateReportedAlreadyButton())
            .addClass('roundcube');

        if (isReported) {
            emailHeader.append(htmlReportedAlready);
        } else {
            var button = $.parseHTML(generateReportEmailButton())
                .addClass('roundcube')
                .bind("click", function() {
                    vex.dialog.confirm({
                        unsafeMessage: generateConfirmationDialog(),
                        callback: function(ok) {
                            // If user clicked cancel, end.
                            if (!ok) {
                                return;
                            }

                            var promise = roundcubeGetEmailSource();
                            if (promise) {
                                promise.then(function(result) {
                                    $("#pd-report")
                                        .unbind("click")
                                        .replaceWith(htmlReportedAlready)

                                    chrome.runtime.sendMessage({
                                        method: "sendRaw",
                                        rawType: "email",
                                        rawContent: result,
                                        identifier: uid,
                                    });
                                });
                            }
                        }
                    });
                });

            emailHeader.append(button);
        }
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
