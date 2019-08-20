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

function getTab(callback) {
    let url = new URL(window.location.href);
    if (url.searchParams.has("tabId")) {
        let parentId = Number(url.searchParams.get("tabId"));
        return chrome.tabs.get(parentId, callback);
    }
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => callback(tabs[0]));
}

function reportPage() {
    getTab(function(tab) {
        chrome.runtime.sendMessage({method: "reportPage", url: tab.url}, function(response) {
            $("#div-reportpage").html("Reported!");
        });
    });
}

function scanPage() {
    getTab(function(tab) {
        chrome.runtime.sendMessage({method: "scanPage", tabId: tab.id, tabUrl: tab.url}, function(response) {
            $("#div-scanpage").html("Scanning...");
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    if (cfg.getNodeEnforceUserAuth() === true && cfg.getApiKey() == "") {
        $("#content").html("<p class=\"mt-4 leading-normal\">We now require PhishDetect users to register a secret token. <a href=\"/ui/apikey/apikey.html\">Continue here to activate your browser!</a> <i class=\"far fa-smile text-blue\"></i></p>");
        return;
    }

    getTab(function(tab) {
        let url = new URL(tab.url);
        let backendURL = new URL(cfg.getNode());
        // We disable the scan this page button for the node site and for Gmail.
        if (url.hostname == backendURL.hostname || url.hostname == "mail.google.com") {
            $("#div-reportpage").html("");
            $("#div-scanpage").html("");
        }

        // We disable the scan this page button if the Node doesn't support
        // scanning.
        chrome.runtime.sendMessage({method: "getNodeEnableAnalysis", tabId: tab.id}, function(response) {
            if (response === false) {
                $("#div-scanpage").html("");
            }
        });
    });

    $("#button-reportpage").on("click", function() {
        reportPage();
    })

    $("#button-scanpage").on("click", function() {
        scanPage();
    });
});
