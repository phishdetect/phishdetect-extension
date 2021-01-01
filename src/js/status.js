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

function setStatusOnline() {
    console.log("PhishDetect Node is online! Yay?");
    cfg.status = "online";
}

function setStatusOffline() {
    console.log("PhishDetect Node is offline! Setting status to offline too.");
    cfg.status = "offline";
}

function setStatusAuthorized() {
    console.log("Setting status as authorized");
    chrome.browserAction.setIcon({path: chrome.extension.getURL("icons/icon@34.png")});
    cfg.status = "authorized";
}

function setStatusUnauthorized() {
    console.log("Setting status as unauthorized!");
    chrome.browserAction.setIcon({path: chrome.extension.getURL("icons/icon_error@34.png")});
    cfg.status = "unauthorized";
}

function checkKeySetIfNeeded() {
    // If the node enforces authentication, but we don't have an API key,
    // we show an error icon in the toolbar.
    if (cfg.getNodeEnforceUserAuth() === true && cfg.getApiKey() == "") {
        console.log("The user does not appear to have configured a required API key!");
        chrome.browserAction.setIcon({path: chrome.extension.getURL("icons/icon_error@34.png")});
        cfg.status = "authorization_needed";
        return false;
    }

    return true;
}
