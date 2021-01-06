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
        timeout: 120000,
        success: function(response) {
            alert("SUCCESS");
            $("#container").html(response);
            console.log(response);
            $(document).trigger("warningLoaded");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("ERROR");
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
        timeout: 120000,
        success: function(response) {
            alert("SUCCESS");
            $("#container").html(response);
            console.log(response);
            $(document).trigger("warningLoaded");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("ERROR");
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
