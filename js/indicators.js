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

function updateIndicators(full = false) {
    // JavaScript's date/timezone handling is ridiculous.
    // Did you know that Date.getMonth() returns a value from 0-11?
    var now = new Date();
    var nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

    // Check if there was never any update or if there wasn't any full
    // update in the last 24 hours.
    if ((cfg.getLastFullUpdateTime() === null) ||
       ((cfg.getLastFullUpdateTime() - nowUTC) > ONE_DAY_TIME)) {
        console.log("Performing a full update...");
        var updateURL = cfg.getIndicatorsURL();
        full = true;
    } else {
        console.log("Only retrieving the latest indicators...");
        var updateURL = cfg.getRecentIndicatorsURL();
    }

    fetch(updateURL)
    .then((response) => response.json())
    .then(function(data) {
        // If it's a full update, we store the whole indicators feed.
        // Otherwise we only append the updates.
        if (full == true) {
            cfg.setIndicators(data);
            cfg.setLastFullUpdateTime();
        } else {
            // First we get the current list.
            indicators = cfg.getIndicators();

            // Then we look for any updates in domains.
            for (var i=0; i<data.domains.length; i++) {
                if (checkForIndicators([data.domains[i],], indicators.domains) === null) {
                    indicators.domains.push(data.domains[i]);
                }
            }
            // We look for any updates in email indicators.
            for (var i=0; i<data.emails.length; i++) {
                if (checkForIndicators([data.emails[i],], indicators.emaisl) === null) {
                    indicators.emails.push(data.emails[i]);
                }
            }

            // Now we update indicators in the storage.
            cfg.setIndicators(indicators);
        }
    })
    .catch(error => {
        console.log(error);
    })
}

// Update indicators at launch.
(function() {
    updateIndicators();
})();
