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

// This is a helper function to check hashes against the list of
// malicious indicators.
function checkForIndicators(items, indicators) {
    for (let i=0; i<indicators.length; i++) {
        var indicator = indicators[i].toLowerCase();
        for (let j=0; j<items.length; j++) {
            if (items[j] == indicator) {
                return indicator;
            }
        }
    }

    return null;
}

// This returns the current UTC ISO Date.
function getCurrentUTCDate() {
    const now = new Date();
    const timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                               now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(),
                               now.getUTCMilliseconds());

    return timestamp;
}

function base64encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function i18nHtmlSafe(key) {
    // Returns html-safe content for `key`
    // Use this when embedding translation strings in html markup
    let translation = chrome.i18n.getMessage(key);
    let textNode = $('<div>').text(translation);
    return textNode.html(); // return html content
}

// This function is used by UI pages to obtain their tab ID.
function getTab(callback) {
    let url = new URL(window.location.href);
    if (url.searchParams.has("tabId")) {
        let parentId = Number(url.searchParams.get("tabId"));
        return chrome.tabs.get(parentId, callback);
    }
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => callback(tabs[0]));
}
