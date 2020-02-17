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

function checkBrowsingHistory() {
    console.log("Checking browsing history...");

    var indicators = cfg.getIndicators();
    if (indicators.domains === undefined || indicators.domains.length == 0) {
        return;
    }

    chrome.history.search({text: "", startTime: 0}, function(items) {
        for (var i=0; i<items.length; i++) {
            var url = items[i].url;

            if (!url.startsWith("http")) {
                continue;
            }

            try {
                var domain = getDomainFromURL(url);
                var domainHash = sha256(domain);
                var topDomain = getTopDomainFromURL(url);
                var topDomainHash = sha256(topDomain);
            } catch (err) {
                console.log("ERROR! Failed to parse history item with URL: ", url);
                continue;
            }

            var elementsToCheck = [
                domainHash,
                topDomainHash
            ];

            var matchedIndicator = checkForIndicators(elementsToCheck, indicators.domains);
            if (matchedIndicator !== null) {
                console.log("FOUND MATCH!", url, matchedIndicator);
            }
        }
    });
}
