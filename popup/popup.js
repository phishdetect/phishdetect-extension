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
        chrome.runtime.sendMessage({method: "scanPage", tabId: tab.id}, function(response) {
            document.getElementById("div-scanpage").innerHTML = "<span class=\"bg-teal text-white py-2 px-4 border-b-4 border-teal-dark hover:text-white hover:no-underline rounded text-lg cursor-default\">Scanning...</span>";
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    getTab(function(tab) {
        let url = new URL(tab.url);
        let backendURL = new URL(getBackendDomain());
        if (url.hostname == backendURL.hostname) {
            document.getElementById("div-scanpage").innerHTML = "";
        }
    });

    var btnScan = document.getElementById("button-scanpage");
    btnScan.addEventListener("click", function() {
        scanPage();
    });
});
