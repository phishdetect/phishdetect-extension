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

function sendAlert(alertType, match, indicator, identifier) {
    var cfg = new Config();

    if (cfg.getSendAlerts() === false) {
        return;
    }

    // Check if the alert type is email_*.
    if (alertType.startsWith("email_")) {
        // If an email identifier was provided...
        if (identifier !== undefined && identifier != "") {
            // Get a list of already reported emails.
            var emails = cfg.getDetectedEmails();
            for (let i=0; i<emails.length; i++) {
                // If the email was already reported before, no need to
                // report it again.
                if (emails[i] == identifier) {
                    return;
                }
            }
        }
    }

    // Craft request to send to REST API server.
    var properties = {
        method: "POST",
        body: JSON.stringify({
            "type": alertType,
            "match": match,
            "indicator": indicator,
            "user_contact": cfg.getContact(),
            "key": cfg.getApiKey(),
        }),
        headers: {"Content-Type": "application/json"},
    };

    fetch(cfg.getEventsURL(), properties)
    .then((response) => response.json())
    .then(function(data) {
        // If alert is of type email_* we add the email ID to the list of
        // successfully reported emails.
        if (alertType.startsWith("email_")) {
            if (identifier !== undefined && identifier != "") {
                cfg.addDetectedEmail(identifier);
            }
        }

        console.log("Sent notification", alertType, "to PhishDetect Node.");
    })
    .catch(error => {
        console.log(error);
    })
}
