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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received a message!", request);
    switch (request.method) {
    case "historyMatchFound":
        var dateTime = new Date(request.match.visitTime);
        $("#alerts").append("<div class=\"mb-4\">" + dateTime + " Suspicious visit to page " + request.match.url + "</div>");
        break;
    case "historyScanCompleted":
        $("#status").text("Scan completed!");
        break;
    }
});

document.addEventListener("DOMContentLoaded", function() {
    console.log("Requesting to launch scanHistory!")

    getTab(function(tab) {
        chrome.runtime.sendMessage({method: "scanHistory", tabId: tab.id});
    });
});
