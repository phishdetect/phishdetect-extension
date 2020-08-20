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

function scanBrowsingHistory(tabId) {
    console.log("Scanning browsing history...");

    var indicators = cfg.getIndicators();
    if (indicators.domains === undefined || indicators.domains.length == 0) {
        console.log("No indicators to use for scanning browsing history. Skip.");
    } else {
        chrome.history.search({text: "", startTime: 0}, function(items) {
            for (let i=0; i<items.length; i++) {
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
                    console.log("ERROR! Failed to parse history item with URL: ", url, " with error: ", err);
                    continue;
                }

                var elementsToCheck = [
                    domainHash,
                    topDomainHash
                ];

                var matchedIndicator = checkForIndicators(elementsToCheck, indicators.domains);
                if (matchedIndicator !== null) {
                    console.log("WARNING! Found match at link " + url + " (indicator: " + matchedIndicator + "). Sending notification to tab with ID: " + tabId);
                    sendAlert("browsing_history", url, matchedIndicator, "");
                    chrome.tabs.sendMessage(tabId, {
                        method: "historyMatchFound",
                        match: {url: url, indicator: matchedIndicator, visitTime: items[i].lastVisitTime},
                    });
                }
            }

            console.log("Browsing history scan completed.");
        });
    }

    chrome.tabs.sendMessage(tabId, {
        method: "historyScanCompleted",
    });
}
