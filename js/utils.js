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

// This is a helper function to check hashes against the list of
// malicious indicators.
function checkForIndicators(items, indicators) {
    for (let i=0; i<indicators.length; i++) {
        let indicator = indicators[i].toLowerCase();
        for (let j=0; j<items.length; j++) {
            if (items[j] == indicator) {
                return indicator;
            }
        }
    }

    return null;
}

// generateWebmailWarning is a helper function used to generate the HTML
// needed to show a warning message inside the supported webmails.
function generateWebmailWarning(eventType) {
    let warning = "<div id=\"phishdetect-warning\" class=\"bg-black text-grey-lighter p-4 pt-0 mb-4 rounded-lg tracking-normal\" style=\"padding-top: 1rem;\">";
    warning += "<span class=\"text-lg\"><i class=\"fas fa-exclamation-triangle\"></i> <b>PhishDetect</b> Warning</span><br />";
    warning += "Please be cautious! ";

    if (eventType == "email_sender" || eventType == "email_sender_domain") {
        warning += "The email was sent by a known malicious address. ";
    } else if (eventType == "email_link") {
        warning += "The email contains known malicious links. ";
    }

    warning += "For more information visit our <a class=\"no-underline\" href=\"https://phishdetect.io/help/\"><span class=\"text-blue-light font-bold\">Help</span></a> page.";
    warning += "</div>";

    return warning;
}
