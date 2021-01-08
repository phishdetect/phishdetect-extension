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

function checkRoundcube() {
    console.log("[PhishDetect] Checking for Roundcube ...");

    var foundLarryCSS = false;
    var foundElasticCSS = false;

    const links = $("link");
    if (links.length == 0) {
        return false;
    }

    for (let i=0; i<links.length; i++) {
        var href = links[i].href;
        if (href.indexOf("/larry/") >= 0) {
            foundLarryCSS = true;
            break;
        } else if (href.indexOf("/elastic/") >= 0) {
            foundElasticCSS = true;
            break;
        }
    }

    if ($("#messageheader, #messagebody").length && foundLarryCSS) {
        console.log("[PhishDetect] Found Roundcube with Larry template!");
        roundcube("larry");
        return true;
    }

    if ($("#layout-content, #message-header, #message-content").length && foundElasticCSS) {
        console.log("[PhishDetect] Found Roundcube with Elastic template!");
        roundcube("elastic");
        return true;
    }

    return false
}

$(document).ready(function() {
    // Check if the option to integrate with webmails is enabled.
    chrome.runtime.sendMessage({method: "getWebmailsIntegration"}, function(response) {
        // If not, we stop straight away.
        if (response === false) {
            return;
        }

        console.log("[PhishDetect] Checking for any supported webmail...");

        if (checkRoundcube()) {
            return;
        }
    });
});
