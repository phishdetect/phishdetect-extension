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

// Check for web requests.
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    // TODO: Should we check for main_frame only?
    // if (details.type != "main_frame") {
    //     return {cancel: false};
    // }

    // We lowercase the link.
    let url = details.url.toLowerCase();

    let domain = window.getDomainFromURL(url);
    let topDomain = window.getTopDomainFromURL(url);

    if (domain === null || topDomain === null) {
        return {cancel: false};
    }

    let domainHash = sha256(domain);
    let topDomainHash = sha256(topDomain);

    let indicators = getIndicators();
    if (indicators === undefined || indicators.domains === undefined || indicators.domains === null) {
        return {cancel: false};
    }

    for (let i=0; i<indicators.domains.length; i++) {
        let badDomainHash = indicators.domains[i].toLowerCase();

        if (badDomainHash == domainHash || badDomainHash == topDomainHash) {
            console.log("Bad domain identified:", url);
            sendEvent("website_visit", url, badDomainHash, "");

            // We redirect to the warning page.
            let redirect = chrome.extension.getURL(WARNING_PAGE) + "?url=" + encodeURIComponent(url);
            return {redirectUrl: redirect};
        }
    }

    // If nothing suspicious is found, proceed with visit.
    return {cancel: false};
},
{urls: ["<all_urls>"]},
["blocking"]
);

// Events.
function injectRedirect(tabId) {
    // Capture screenshot of page.
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        // Inject some data in the page.
        chrome.tabs.executeScript(tabId, {
            code: "var screenshot = '" + img + "'; var backend = '" + cfg.getLinkCheckURL() + "';"
        }, function() {
            // Inject our redirector.
            chrome.tabs.executeScript(tabId, {file: "js/pageInject.js"});
        });
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // This message is received when the user requests to scan an opened page.
    if (request.method === "scanPage") {
        injectRedirect(request.tabId);
        return false;
    // This message is received when a security event was detected and needs to be sent
    // to the PhishDetect node.
    } else if (request.method == "sendEvent") {
        // Send event to REST API server.
        sendEvent(request.eventType, request.match, request.indicator, request.identifier);
        return false;
    } else if (request.method == "sendRaw") {
        sendRaw(request.rawType, request.rawContent, request.identifier);
        return false
    // Get the flag to enable or disable Gmail integration.
    } else if (request.method === "getGmail") {
        sendResponse(cfg.getGmail());
    // This message is received when a component of the extension is requesting the
    // check URL, normally from gmail.js.
    } else if (request.method === "getLinkCheckURL") {
        sendResponse(cfg.getLinkCheckURL());
    // This message is received when a component of the extension is requesting the
    // full list of indicators, normally from gmail.js.
    } else if (request.method === "getIndicators") {
        sendResponse(getIndicators());
    // This message returns the list of email IDs that were already previously shared.
    } else if (request.method == "getSharedEmails") {
        sendResponse(cfg.getSharedEmails());
    }
});

// Activate on click of the extension button.
chrome.browserAction.onClicked.addListener(function(tab) {
    const url = chrome.extension.getURL("/popup/index.html?tabId=" + tab.id);
    chrome.tabs.create({url});
});

// Context menus.
function loadContextMenus() {
    chrome.contextMenus.create({
        "title": "Scan this page for phishing",
        "id": "scan-page",
        "contexts": ["page", "frame"]
    });

    chrome.contextMenus.create({
        "title": "Scan this link for phishing",
        "id": "scan-link",
        "contexts": ["link"]
    });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    // If we're scanning a page, we inject a JavaScript that collects the HTML
    // and returns it to us.
    if (info.menuItemId === "scan-page") {
        injectRedirect(tab.id);
        return false;
    // If we're scanning a link, we just open a tab to our service.
    } else if (info.menuItemId === "scan-link") {
        let linkUrl = info.linkUrl;
        let safeUrl = cfg.getLinkCheckURL() + window.btoa(linkUrl);
        chrome.tabs.create({"url": safeUrl});
        return false;
    }
});

chrome.runtime.onInstalled.addListener(loadContextMenus);
chrome.runtime.onStartup.addListener(loadContextMenus);
