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

$(document).ready(function() {
    // Check if the option to integrate with webmails is enabled.
    chrome.runtime.sendMessage({method: "getWebmails"}, function(response) {
        // If not, we stop straight away.
        if (response === false) {
            return;
        }

        console.log("[PhishDetect] Checking for any supported webmail...");

        var handler = null;

        // First we check if there are typical Rouncube elements.
        if ($("#rcmbtn100, #rcmbtn101, #rcmbtn102").length) {
            // Then we use the stylesheet URL to figure which skin is being
            // used, between Larry and Elastic.
            var links = $("link");
            if (links.length == 0) {
                return;
            }

            for (let i=0; i<links.length; i++) {
                var href = links[i].href;
                if (href.indexOf("/larry/") >= 0) {
                    console.log("[PhishDetect] Found Roundcube with Larry skin!");
                    handler = "roundcube-larry";
                    break;
                } else if (href.indexOf("/elastic/") >= 0) {
                    console.log("[PhishDetect] Found Roundcube wih Elastic skin!");
                    handler = "roundcube-elastic";
                    break;
                }
            }
        }

        // We launch the detected webmails initialization functions only later,
        // as they require to load font awesome, and we want to avoid loading
        // it even on unrelated pages.
        if (handler !== null) {
            chrome.runtime.sendMessage({method: "loadFontAwesome"}, function(response) {
                switch (handler) {
                case "roundcube-elastic":
                    roundcube("elastic");
                    break;
                case "roundcube-larry":
                    roundcube("larry");
                    break;
                }
            });
        }
    });
});
