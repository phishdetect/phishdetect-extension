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

function updateIndicators(full = false) {
    if (!checkKeySetIfNeeded()) {
        console.log("Node enforces user authentication and no API key is provided. " +
                    "Skipping indicators update.");
        return;
    }

    // Check if there was never any update or if there wasn't any full
    // update in the last 24 hours.
    const now = getCurrentUTCDate();
    if (full == true || ((cfg.getLastFullUpdateTime() === null) ||
       ((now - cfg.getLastFullUpdateTime()) >= ONE_DAY_TIME))) {
        console.log("Performing a full update...");
        var updateURL = cfg.getIndicatorsURL();
        full = true;
    } else {
        console.log("Only retrieving the latest indicators...");
        var updateURL = cfg.getRecentIndicatorsURL();
    }

    console.log("Fetching indicators from:", updateURL);

    fetch(updateURL)
        .then(function(response) {
            // If user is not authorized, then we change the status to unauthorized,
            // display warning icon, etc.
            if (response.status == 200) {
                setStatusAuthorized();
            } else if (response.status == 401) {
                console.log("ERROR: The indicators update failed: user is not authorized!");
                setStatusUnauthorized();
                return null;
            }

            return response.json();
        })
        .then(function(data) {
            if (data === null)
                return;

            // If some other error occurred, return.
            if ("error" in data) {
                console.log("ERROR: The indicators update failed:", data.error);
                return;
            }

            // If it's a full update, we store the whole indicators feed.
            // Otherwise we only append the updates.
            if (full == true) {
                console.log("Replacing local indicators with remote list...");
                cfg.setIndicators(data, () => {
                    console.log("Stored full indicator list");
                    cfg.setLastFullUpdateTime();
                });
            } else {
                console.log("Updating local indicators with only new ones...");

                // First we get the current list.
                var indicators = cfg.getIndicators();

                // Then we look for any updates in domains.
                for (let i=0; i<data.domains.length; i++) {
                    if (checkForIndicators([data.domains[i],], indicators.domains) === null) {
                        indicators.domains.push(data.domains[i]);
                    }
                }
                // We look for any updates in email indicators.
                for (let i=0; i<data.emails.length; i++) {
                    if (checkForIndicators([data.emails[i],], indicators.emails) === null) {
                        indicators.emails.push(data.emails[i]);
                    }
                }

                // Now we update indicators in the storage.
                cfg.setIndicators(indicators, () => {
                    console.log("Stored updated indicator list");
                });
            }

            console.log("Indicators updated successfully.");
        })
        .catch(error => {
            console.log("ERROR: Fetching indicators failed:", error);
        });
}
