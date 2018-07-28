// Copyright (c) 2018 Claudio Guarnieri.
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

function injectRedirect(tabId) {
    // Capture screenshot of page.
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        // Inject some data in the page.
        chrome.tabs.executeScript(tabId, {
            code: "var screenshot = '" + img + "'; var backend = '" + getBackendURL() + "';"
        }, function() {
            // Inject our redirector.
            chrome.tabs.executeScript(tabId, {file: "js/html.js"});
        });
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "scanPage") {
        injectRedirect(request.tabId);
        return false;
    }
});

// Activate on click of the extension button.
chrome.browserAction.onClicked.addListener(function(tab) {
    const url = chrome.extension.getURL("/popup/index.html?tabId=" + tab.id);
    chrome.tabs.create({url});
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    // If we're scanning a page, we inject a JavaScript that collects the HTML
    // and returns it to us.
    if (info.menuItemId === "scan-page") {
        injectRedirect(tab.id);
        return false;
    // If we're scanning a link, we just open a tab to our service.
    } else if (info.menuItemId === "scan-link") {
        var linkUrl = info.linkUrl;
        var safeUrl = getBackendURL() + window.btoa(linkUrl);
        chrome.tabs.create({"url": safeUrl});
        return false;
    }
});

chrome.runtime.onInstalled.addListener(loadContextMenus);
chrome.runtime.onStartup.addListener(loadContextMenus);
