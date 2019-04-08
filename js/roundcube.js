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

function checkEmail() {
    let iframe = document.getElementById("messagecontframe");
    if (iframe === null) {
        return;
    }

    // We get the document from the iframe.
    let innerDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;

    let from = innerDoc.getElementsByClassName("rcmContactAddress")[0];
    // If we do not find any sender, we might not have any email open.
    if (from === null || from === undefined) {
        return;
    }

    let fromEmail = from.href.toLowerCase().replace("mailto:", "");
    console.log("Checking email sender: " + fromEmail);

    let fromEmailHash = sha256(fromEmail);
    let fromEmailDomain = "";
    let fromEmailDomainHash = "";
    let fromEmailTopDomain = "";
    let fromEmailTopDomainHash = "";

    // We extract the domain from the email address.
    let parts = fromEmail.split('@');
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
            let elementsToCheck = [fromEmailHash,];
            let matchedIndicator = isElementInIndicators(elementsToCheck, indicators.emails);
            if (matchedIndicator !== null) {
                console.log("Detected bad email sender with indicator:", matchedIndicator);

                // Mark email as bad.
                isEmailBad = true;
                eventType = "email_sender";
                eventMatch = fromEmail;
                eventIndicator = matchedIndicator;
            }
        }

        // TODO: this is ugly.
        // If there is any malicious element we proceed with notifications.
        if (isEmailBad === true) {
            // First we send an "event" to the PhishDetect Node through the "sendEvent"
            // message to the background script. This will proceed only if the
            // appropriate settings option is enabled.
            // chrome.runtime.sendMessage({
            //     method: "sendEvent",
            //     eventType: eventType,
            //     match: eventMatch,
            //     indicator: eventIndicator,
            //     identifier: "",
            // });

            // Then we display a warning to the user inside the Gmail web interface.
            let emailBody = innerDoc.getElementById("messagebody");
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

function roundcube() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(function(mutations, observer) {
        checkEmail();
    });

    // TODO: Need to find the proper mutation.
    observer.observe(document, {
        subtree: true,
        attributes: true
    });
}
