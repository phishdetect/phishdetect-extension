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
    var url = details.url.toLowerCase();

    var domain = window.getDomainFromURL(url);
    var topDomain = window.getTopDomainFromURL(url);

    if (domain === null || topDomain === null) {
        return {cancel: false};
    }

    var domainHash = sha256(domain);
    var topDomainHash = sha256(topDomain);

    var indicators = cfg.getIndicators();
    if (indicators === undefined || indicators.domains === undefined || indicators.domains === null) {
        return {cancel: false};
    }

    var itemsToCheck = [domainHash, topDomainHash];
    var matchedIndicator = checkForIndicators(itemsToCheck, indicators.domains);
    if (matchedIndicator !== null) {
        console.log("Bad domain identified:", url);
        sendEvent("website_visit", url, matchedIndicator, "");

        // We redirect to the warning page.
        var redirect = chrome.extension.getURL(WARNING_PAGE) + "?url=" + encodeURIComponent(url) + "&indicator=" + matchedIndicator;
        return {redirectUrl: redirect};
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
        var code = "var screenshot = '" + img + "'; var backend = '" + cfg.getLinkCheckURL("{{URL}}") + "';";
        chrome.tabs.executeScript(tabId, {
            code: code
        }, function() {
            // Inject our redirector.
            chrome.tabs.executeScript(tabId, {file: "js/pageInject.js"});
        });
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
    // This message is received when a component of the extension is requesting the
    // full list of indicators.
    case "getIndicators":
        sendResponse(cfg.getIndicators());
        break;
    // This message is received when the user requests to scan an opened page.
    case "scanPage":
        injectRedirect(request.tabId);
        break;
    // This message is received when the user wants to report a suspicious opened page.
    case "reportPage":
        var nodeUrl = cfg.getReportURL(window.btoa(request.url));
        chrome.tabs.create({"url": nodeUrl});
        break;
    // This message is received when a security event was detected and needs to be sent
    // to the PhishDetect node.
    case "sendEvent":
        // Send event to REST API server.
        sendEvent(request.eventType, request.match, request.indicator, request.identifier);
        break;
    case "sendRaw":
        sendRaw(request.rawType, request.rawContent, request.identifier);
        break;
    // Get the flag to enable or disable webmails integration.
    case "getWebmails":
        sendResponse(cfg.getWebmails());
        break;
    // This message is received when a component of the extension is requesting the
    // check URL.
    case "getLinkCheckURL":
        sendResponse(cfg.getLinkCheckURL(window.btoa(request.url)));
        break;
    // This message returns the list of email IDs that were already previously shared.
    case "getReportedEmails":
        sendResponse(cfg.getReportedEmails());
        break;
    case "getNodeEnableAnalysis":
        sendResponse(cfg.getNodeEnableAnalysis());
        break;
    case "loadFontAwesome":
        console.log("Injecting FontAwesome into tab...");
        chrome.tabs.executeScript(sender.tab.id, {file: "../fontawesome/js/all.js", allFrames: true, runAt: "document_end"}, function(result) {
            console.log(result);
            if (chrome.runtime.lastError) {
                console.log("ERROR: FontAwesome injection failed:", chrome.runtime.lastError.message);
            }
            sendResponse(true);
        });
        break;
    }
    return false;
});

// Context menus.
function loadContextMenus() {
    chrome.contextMenus.create({
        "title": "Report this page as suspicious",
        "id": "report-page",
        "contexts": ["page", "frame"]
    });
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

    chrome.contextMenus.create({
        "title": "Report this link as suspicious",
        "id": "report-link",
        "contexts": ["link"]
    });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId) {
    case "scan-page":
        injectRedirect(tab.id);
        break;
    case "scan-link":
        var nodeUrl = cfg.getLinkCheckURL(window.btoa(info.linkUrl));
        chrome.tabs.create({"url": nodeUrl});
        break;
    case "report-page":
        var nodeUrl = cfg.getReportURL(window.btoa(info.pageUrl));
        chrome.tabs.create({"url": nodeUrl});
        break;
    case "report-link":
        var nodeUrl = cfg.getReportURL(window.btoa(info.linkUrl));
        chrome.tabs.create({"url": nodeUrl});
        break;
    }

    return false;
});

chrome.runtime.onInstalled.addListener(loadContextMenus);
chrome.runtime.onStartup.addListener(loadContextMenus);
