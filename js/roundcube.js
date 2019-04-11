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

function roundcubeCheckEmail() {
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

        // Get email body.
        let emailBody = innerDoc.getElementById("messagebody");

        // We check for email addresses, if we have any indicators to check.
        if (indicators.emails !== null) {
            let itemsToCheck = [fromEmailHash,];
            let matchedIndicator = checkForIndicators(itemsToCheck, indicators.emails);
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
            let itemsToCheck = [fromEmailDomainHash, fromEmailTopDomainHash];
            let matchedIndicator = checkForIndicators(itemsToCheck, indicators.domains);
            if (matchedIndicator !== null) {
                console.log("Detected email sender domain with indicator:", matchedIndicator);

                isEmailBad = true;
                eventType = "email_sender_domain";
                eventMatch = fromEmail;
                eventIndicator = matchedIndicator;
            }

            // Now we check for links in the email body.
            let anchors = emailBody.getElementsByTagName("a");

            for (let i=0; i<anchors.length; i++) {
                // Lowercase the link.
                let href = anchors[i].href.toLowerCase();

                // Only check for HTTP links.
                // NOTE: also scanning for mailto: links (currently experimental).
                if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0 && href.indexOf("mailto:") != 0) {
                    continue;
                }

                console.log("Checking link:", href);

                let hrefDomain = getDomainFromURL(href);
                let hrefDomainHash = sha256(hrefDomain);
                let hrefTopDomain = getTopDomainFromURL(href);
                let hrefTopDomainHash = sha256(hrefTopDomain);

                // We loop through the list of hashed bad domains.
                let elementsToCheck = [hrefDomainHash, hrefTopDomainHash];
                let matchedIndicator = checkForIndicators(elementsToCheck, indicators.domains);
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
            // chrome.runtime.sendMessage({
            //     method: "sendEvent",
            //     eventType: eventType,
            //     match: eventMatch,
            //     indicator: eventIndicator,
            //     identifier: "",
            // });

            // Then we display a warning to the user inside the Gmail web interface.
            let existingWarning = innerDoc.getElementById("phishdetect-warning");
            if (existingWarning === null || existingWarning === undefined) {
                let warning = generateWebmailWarning(eventType);
                emailBody.insertAdjacentHTML("afterbegin", warning);
            }
        }
    });
}

function roundcube() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(function(mutations, observer) {
        roundcubeCheckEmail();
    });

    // TODO: Need to find the proper mutation.
    observer.observe(document, {
        subtree: true,
        attributes: true
    });
}
