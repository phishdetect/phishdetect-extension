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

// Analyze an HTML page (taken from an open tab).
function scanPage(tabId, tabUrl) {
    console.log("Received request to analyze page at tab", tabId, "with URL", tabUrl);
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        console.log("Captured screenshot.");
        chrome.tabs.sendMessage(tabId, {
            method: "sendPageToNode",
            actionUrl: cfg.getLinkCheckURL(base64encode(tabUrl)),
            screenshot: img,
            key: cfg.getApiKey(),
        });
    });
}

// Analyze a link (coming from webmail and context menu).
function scanLink(link) {
    console.log("Received request to analyze link", link);
    var url = cfg.getLinkCheckURL(base64encode(link)) + "?key=" + cfg.getApiKey();
    chrome.tabs.create({url: url});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
    //=========================================================================
    // Messages related to indicators.
    //=========================================================================
    // This message is received when a component of the extension is requesting the
    // full list of indicators.
    case "getIndicators":
        sendResponse(cfg.getIndicators());
        break;

    //=========================================================================
    // Messages related to link and page analysis.
    //=========================================================================
    // This message is received when the user requests to scan an opened page.
    case "scanPage":
        scanPage(request.tabId, request.tabUrl);
        break;
    case "scanLink":
        scanLink(request.link);
        break;

    //=========================================================================
    // Messages sending data to the Node.
    //=========================================================================
    // This message is received when the user wants to report a suspicious opened page.
    case "reportPage":
        var nodeUrl = cfg.getReportURL(base64encode(request.url));
        chrome.tabs.create({"url": nodeUrl});
        break;
    // This message is received when a security event was detected and needs to be sent
    // to the PhishDetect node.
    case "sendEvent":
        // Send event to REST API server.
        sendEvent(request.eventType, request.match, request.indicator, request.identifier);
        break;
    case "sendReport":
        sendReport(request.reportType, request.reportContent, request.identifier);
        break;

    //=========================================================================
    // Messages requesting configuration options.
    //=========================================================================
    // Get the flag to enable or disable webmails integration.
    case "getWebmails":
        sendResponse(cfg.getWebmails());
        break;
    case "getNodeEnableAnalysis":
        sendResponse(cfg.getNodeEnableAnalysis());
        break;

    //=========================================================================
    // Extras
    //=========================================================================
    // This message returns the list of email IDs that were already previously shared.
    case "getReportedEmails":
        sendResponse(cfg.getReportedEmails());
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
        "title": chrome.i18n.getMessage("contextMenuReportPage"),
        "id": "report-page",
        "contexts": ["page", "frame"]
    });
    chrome.contextMenus.create({
        "title": chrome.i18n.getMessage("contextMenuScanPage"),
        "id": "scan-page",
        "contexts": ["page", "frame"]
    });

    chrome.contextMenus.create({
        "title": chrome.i18n.getMessage("contextMenuScanLink"),
        "id": "scan-link",
        "contexts": ["link"]
    });

    chrome.contextMenus.create({
        "title": chrome.i18n.getMessage("contextMenuReportLink"),
        "id": "report-link",
        "contexts": ["link"]
    });
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId) {
    case "scan-page":
        scanPage(tab.id, tab.url);
        break;
    case "scan-link":
        scanLink(info.linkUrl);
        break;
    case "report-page":
        var nodeUrl = cfg.getReportURL(base64encode(info.pageUrl));
        chrome.tabs.create({"url": nodeUrl});
        break;
    case "report-link":
        var nodeUrl = cfg.getReportURL(base64encode(info.linkUrl));
        chrome.tabs.create({"url": nodeUrl});
        break;
    }

    return false;
});

chrome.runtime.onInstalled.addListener(loadContextMenus);
chrome.runtime.onStartup.addListener(loadContextMenus);
