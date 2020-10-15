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

import React from "react";
import ReactDOM from "react-dom";
import { PopupActivate, PopupStatusWarning } from "../../components/Popup.js";

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
            $("#divScanPage").text(chrome.i18n.getMessage("popupScanning"));
        });
    });
}

function loadPopup() {
    var content_container = $("#content");
    if (cfg.status == "authorization_needed") {
        // Override all UI if user has not enabled an API key yet.
        ReactDOM.render(React.createElement(PopupActivate), content_container.empty().get(0));
        return;
    }

    var status_container = $("#divPopupServerStatus");
    if (cfg.status == "offline") {
        ReactDOM.render(React.createElement(PopupStatusWarning, {message: "serverOfflineWarning"}), status_container.get(0));
    } else if (cfg.status == "unauthorized") {
        ReactDOM.render(React.createElement(PopupStatusWarning, {message: "serverUnauthorizedWarning"}), status_container.get(0));
    }

    // Show interactive buttons if the node is online and reachable.
    if (cfg.status == "authorized" || cfg.status == "online") {
        $(".pd-needs-online").show();
    }

    getTab(function(tab) {
        const url = new URL(tab.url);
        const backendURL = new URL(cfg.getNode());

        // We disable the report and scan this page buttons for browser pages,
        // the node site, and Gmail.
        if (url.protocol == "chrome:" || url.protocol == "about:"                   ||
            url.protocol == "chrome-extension:" || url.protocol == "moz-extension:" ||
            url.hostname == backendURL.hostname || url.hostname == "mail.google.com") {
            $("#divReportPage").hide();
            $("#divScanPage").hide();
        }

        // We disable the scan this page button if the Node doesn't support
        // scanning.
        chrome.runtime.sendMessage({method: "getNodeEnableAnalysis", tabId: tab.id}, function(response) {
            if (response === false) {
                $("#divScanPage").hide();
            }
        });
    });

    $("#buttonReportPage").on("click", function() {
        reportPage();
    });

    $("#buttonScanPage").on("click", function() {
        scanPage();
    });
}

document.addEventListener("DOMContentLoaded", cfg.loadFromBackground(loadPopup));
