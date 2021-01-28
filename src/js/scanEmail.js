// Copyright (c) 2018-2021 Claudio Guarnieri.
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

// scanEmail will try to determine if any element in the email matches a
// known indicator. In order to do so it will try to:
//   1. Check the full email sender among the list of blocklisted email addresses.
//   2. Check the domain of the email sender among the list of blocklisted domains.
//   3. Check all the anchors in the email among the list of blocklisted domains.
// If it matches anything, it will display a warning, highlight any bad link,
// and send an alert through the "sendAlert" message to the background script.
export default function scanEmail(fromEmail, emailBody, uid) {
    console.log("[PhishDetect] Checking email sender:", fromEmail);

    const fromEmailHash = sha256(fromEmail);
    let fromEmailDomain = "";
    let fromEmailDomainHash = "";
    let fromEmailTopDomain = "";
    let fromEmailTopDomainHash = "";

    // We extract the domain from the email address.
    let parts = fromEmail.split("@");
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
        const indicators = response;

        if (indicators === undefined) {
            return false;
        }

        // Email status.
        let isEmailBad = false;
        let alertType = "";
        let alertMatch = "";
        let alertIndicator = "";

        // We check for email addresses, if we have any indicators to check.
        if (indicators.emails !== null) {
            let itemsToCheck = [fromEmailHash,];
            let matchedIndicator = checkForIndicators(itemsToCheck, indicators.emails);
            if (matchedIndicator !== null) {
                console.log("[PhishDetect] Detected bad email sender with indicator:", matchedIndicator);

                // Mark email as bad.
                isEmailBad = true;
                alertType = "email_sender";
                alertMatch = fromEmail;
                alertIndicator = matchedIndicator;
            }
        }

        // TODO: Need to review the performance of this.
        // We check for domains, if we have any indicators to check.
        if (indicators.domains !== null) {
            // First we check the domain of the email sender.
            let itemsToCheck = [fromEmailDomainHash, fromEmailTopDomainHash];
            let matchedIndicator = checkForIndicators(itemsToCheck, indicators.domains);
            if (matchedIndicator !== null) {
                console.log("[PhishDetect] Detected email sender domain with indicator:", matchedIndicator);

                // Mark whole email as bad.
                // TODO: this is ugly.
                isEmailBad = true;
                alertType = "email_sender_domain";
                alertMatch = fromEmail;
                alertIndicator = matchedIndicator;
            }

            // Now we check for links contained in the emails body.
            // We extract all links from the body of the email.
            let anchors = $(emailBody).find("a, area");

            // TODO: Might want to reverse these loops for performance reasons.
            for (let i=0; i<anchors.length; i++) {
                // First we check if the href link is actually a string.
                if (typeof anchors[i].href !== "string") {
                    continue;
                }

                // Lowercase the link.
                let href = anchors[i].href.toLowerCase();

                // Only check for HTTP links.
                // NOTE: also scanning for mailto: links (currently experimental).
                if (href.indexOf("http://") != 0 && href.indexOf("https://") != 0 && href.indexOf("mailto:") != 0) {
                    continue;
                }

                console.log("[PhishDetect] Checking link:", href);

                let hrefDomain = getDomainFromURL(href);
                let hrefDomainHash = sha256(hrefDomain);
                let hrefTopDomain = getTopDomainFromURL(href);
                let hrefTopDomainHash = sha256(hrefTopDomain);

                // We loop through the list of hashed bad domains.
                let elementsToCheck = [hrefDomainHash, hrefTopDomainHash];
                let matchedIndicator = checkForIndicators(elementsToCheck, indicators.domains);
                if (matchedIndicator !== null) {
                    console.log("[PhishDetect] Detected bad link with indicator:", matchedIndicator);

                    // We add a warning sign to the link.
                    generateWebmailLinkWarning(anchors[i]);

                    // Mark whole email as bad.
                    // TODO: this is ugly.
                    isEmailBad = true;
                    alertType = "email_link";
                    alertMatch = href;
                    alertIndicator = matchedIndicator;

                    break;
                }
            }
        }

        // TODO: this is ugly.
        // If there is any malicious element we proceed with notifications.
        if (isEmailBad === true) {
            // First we send an "event" to the PhishDetect Node through the "sendAlert"
            // message to the background script. This will proceed only if the
            // appropriate settings option is enabled.
            chrome.runtime.sendMessage({
                method: "sendAlert",
                alertType: alertType,
                match: alertMatch,
                indicator: alertIndicator,
                identifier: uid,
            });

            // Then we display a warning to the user inside the Gmail web interface.
            var warning = generateWebmailWarning(alertType);
            emailBody.prepend(warning);
        }
    });
}
