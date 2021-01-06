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

import React from "react";
import ReactDOM from "react-dom";
import { ScanResultsContinue, ScanResultsWarning } from "../../components/ScanResults";

const requestTimeout = 120000;

function renderResults(data) {
    if ((data.safelisted || data.score < 30) && !data.dangerous) {
        ReactDOM.render(
            React.createElement(ScanResultsContinue, data),
            $("#container").get(0)
        );
    } else {
        ReactDOM.render(
            React.createElement(ScanResultsWarning, data),
            $("#container").get(0)
        );
    }
}

function scanHTML(url, html, screenshot) {
    $.post({
        url: cfg.getAPIAnalyzeHTMLURL(),
        data: JSON.stringify({
            "url": url,
            "html": html,
        }),
        dataType: "json",
        contentType: "application/json",
        cache: false,
        timeout: requestTimeout,
        success: function(response) {
            let data = response;
            data.screenshot = screenshot;
            renderResults(data);
            $(document).trigger("warningLoaded");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function scanLink(url) {
    $.post({
        url: cfg.getAPIAnalyzeLinkURL(),
        data: JSON.stringify({
            "url": url,
        }),
        dataType: "json",
        contentType: "application/json",
        cache: false,
        timeout: requestTimeout,
        success: function(response) {
            renderResults(response);
            $(document).trigger("warningLoaded");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function loadScan() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch (request.method) {
        case "scanHTML":
            scanHTML(request.url, request.html, request.screenshot);
            break;
        case "scanLink":
            scanLink(request.url);
            break;
        }
    });
}

document.addEventListener("DOMContentLoaded", cfg.loadFromBackground(loadScan));
