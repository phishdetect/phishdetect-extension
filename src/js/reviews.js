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

function sendReview(ioc, tabId) {
    const properties = {
        method: "POST",
        body: JSON.stringify({
            "indicator": ioc,
            "key": cfg.getApiKey(),
        }),
        headers: {"Content-Type": "application/json"},
    };

    fetch(cfg.getAPIReviewsAddURL(), properties)
        .then((response) => response.json())
        .then(function(data) {
            console.log("Submitted review for indicator", ioc, "to PhishDetect Node.");
            chrome.tabs.update(tabId,{url: chrome.extension.getURL(REVIEW_PAGE)});
        })
        .catch(error => {
            console.log("Failed to submit review: ", error);
            chrome.tabs.update(tabId,{url: chrome.extension.getURL(REVIEW_FAILED_PAGE)});
        });
}
