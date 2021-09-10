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
import { ScanResultsSafelisted, ScanResultsContinue, ScanResultsWarning, ScanResultsDanger} from "../../components/ScanResults";

const requestTimeout = 120000;

function renderResults(data) {
    if (data.safelisted) {
        ReactDOM.render(
            React.createElement(ScanResultsSafelisted, data),
            $("#container").get(0)
        );
    } else {
        if (data.score < 30) {
            ReactDOM.render(
                React.createElement(ScanResultsContinue, data),
                $("#container").get(0)
            );
            $("#pleaseReport").on("click", function() {
                chrome.runtime.sendMessage({method: "sendReport", reportType: "url", reportContent: data.url}, function(response) {
                    $("#reportResults").text(chrome.i18n.getMessage("scanResultsThankYouForReport"));
                });
            });
        // If instead it was not safelisted, and the score is between 30 and 50,
        // we mark it as a warning.
        } else if (!data.safelisted && data.score >= 30 && data.score <= 50) {
            ReactDOM.render(
                React.createElement(ScanResultsWarning, data),
                $("#container").get(0)
            );
        // If it was not safelisted and the score is higher than 50, it is almost
        // certainly bad.
        } else if (!data.safelisted && data.score > 50) {
            ReactDOM.render(
                React.createElement(ScanResultsDanger, data),
                $("#container").get(0)
            );
        }
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
