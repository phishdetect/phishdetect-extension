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

function reportPage() {
    getTab(function(tab) {
        chrome.runtime.sendMessage({method: "sendReport", reportType: "url", reportContent: tab.url}, function(response) {
            $("#divReportPage").text(chrome.i18n.getMessage("popupReported"));
        });
    });
}

function scanPage() {
    getTab(function(tab) {
        chrome.runtime.sendMessage({method: "scanPage", tabId: tab.id, tabUrl: tab.url}, function(response) {
            $("#scanBird").attr("src", "scan_bird.gif");
            $("#divScanButton").text("Scanning...");
            $("#divReportPage").hide();
        });
    });
}

function error(msg) {
    $("#divPopupActions").hide();
    $("#divPopupServerStatus").text(msg)
    $("#divPopupServerStatus").show();
}

function loadPopup() {
    if (cfg.status == "offline") {
        error("Oops! The PhishDetect server seems to be offline at the moment, or your Internet connection might be down!")
        return;
    } else if (cfg.status == "unauthorized") {
        error("Hold tight! Your admin has not yet activated your account!");
        return;
    } else if (cfg.status == "authorization_needed") {
        error("Your Network requires registration!");
        return;
    }

    getTab(function(tab) {
        const url = new URL(tab.url);
        const backendURL = new URL(cfg.getNode());

        // We disable the report and scan this page buttons for browser pages,
        // the node site, and Gmail.
        if (url.protocol == "chrome:" || url.protocol == "about:"                   ||
            url.protocol == "chrome-extension:" || url.protocol == "moz-extension:" ||
            url.hostname == backendURL.hostname || url.hostname == "mail.google.com") {
            $("#divPopupActions").text("PhishDetect doesn't work on this webpage.")
        }

        chrome.runtime.sendMessage({method: "getNodeEnableAnalysis", tabId: tab.id}, function(response) {
            if (response === true) {
                $("#popupFullActions").show();
                $("#popupLimitedActions").hide();
            } else {
                $("#popupFullActions").hide();
                $("#popupLimitedActions").show();
            }
        });
    });

    $("#buttonScanPage").on("click", function() {
        scanPage();
    });
    $("#linkReportPage").on("click", function() {
        reportPage();
    });
    $("#buttonReportPage").on("click", function() {
        reportPage();
    });
}

document.addEventListener("DOMContentLoaded", cfg.loadFromBackground(loadPopup));
