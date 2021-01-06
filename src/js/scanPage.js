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

// Analyze an HTML page (taken from an open tab).
// Welcome to callback hell.
function scanPage(tabId, tabUrl) {
    console.log("Received request to analyze page at tab", tabId, "with URL", tabUrl);
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        chrome.tabs.executeScript(tabId, {file: "./js/getTabHTML.js"}, function() {
            if (chrome.runtime.lastError) {
                // TODO: Show error page.
                console.error("Failed to execute getTabHTML: " + chrome.runtime.lastError.message);
                return;
            }

            chrome.tabs.sendMessage(tabId, {method: "getTabHTML"}, function(response) {
                var encodedHTML = base64encode(response);

                chrome.tabs.update(tabId, {url: chrome.extension.getURL(SCAN_PAGE)}, function() {
                    chrome.tabs.onUpdated.addListener(function onUpdated(updatedTabId, updatedTabInfo) {
                        if (tabId == updatedTabId && updatedTabInfo.status === "complete") {
                            chrome.tabs.sendMessage(tabId, {method: "scanHTML", url: tabUrl, screenshot: img, html: encodedHTML});
                        }
                    });
                });
            });
        });
    });
}
