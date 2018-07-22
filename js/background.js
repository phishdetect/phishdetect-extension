function injectRedirect(tabId) {
    // Capture screenshot of page.
    chrome.tabs.captureVisibleTab(null, {}, function(img) {
        // Inject some data in the page.
        chrome.tabs.executeScript(tabId, {
            code: "var screenshot = '" + img + "'; var backend = '" + getBackendURL() + "';"
        }, function() {
            // Load jQuery.
            // TODO: We don't actually need this.
            chrome.tabs.executeScript(tabId, {file: "js/libs/jquery.js"}, function() {
                // Inject our redirector.
                chrome.tabs.executeScript(tabId, {file: "js/html.js"});
            });
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
