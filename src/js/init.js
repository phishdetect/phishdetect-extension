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

(function() {
    console.log("*** PhishDetect init ***")

    var cfg = new Config();

    cfg.initLocalStorage();
    cfg.fetchNodeConfig(function() {
        // If the node enforces authentication, but we don't have an API key,
        // we show an error icon in the toolbar.
        if (cfg.getNodeEnforceUserAuth() === true && cfg.getApiKey() == "") {
            console.log("The user does not appear to have configured a required API key!");
            chrome.browserAction.setIcon({path: chrome.extension.getURL("icons/icon_error@34.png")});
        } else {
            // If everything is fine, we launch an update of indicators.
            updateIndicators();
        }
    });
})();
