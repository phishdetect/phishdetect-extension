function getTab(callback) {
    let url = new URL(window.location.href);
    if (url.searchParams.has("tabId")) {
        let parentId = Number(url.searchParams.get("tabId"));
        return chrome.tabs.get(parentId, callback);
    }
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => callback(tabs[0]));
}

function scanPage() {
    getTab(function(tab) {
        chrome.runtime.sendMessage({greeting: "scanPage", tabId: tab.id}, function(response) {
            document.getElementById("div-scanpage").innerHTML = "<span class=\"bg-teal text-white py-2 px-4 border-b-4 border-teal-dark hover:text-white hover:no-underline rounded text-lg cursor-default\">Scanning...</span>";
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    getTab(function(tab) {
        let url = new URL(tab.url);
        if (url.hostname == "phishdetect.io") {
            document.getElementById("div-scanpage").innerHTML = "";
        }
    });

    var btnScan = document.getElementById("button-scanpage");
    btnScan.addEventListener("click", function() {
        scanPage();
    });
});
