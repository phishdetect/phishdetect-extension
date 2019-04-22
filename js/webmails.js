// Copyright (c) 2018-2019 Claudio Guarnieri.
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

function checkAllElements(elements) {
    var counter = 0;
    for (var i=0; i<elements.length; i++) {
        if (document.getElementById(elements[i]) !== null) {
            counter++;
        }
    }

    if (counter == elements.length) {
        return true;
    }

    return false;
}

$(document).ready(function() {
    // Check if the option to integrate with webmails is enabled.
    chrome.runtime.sendMessage({method: "getWebmails"}, function(response) {
        // If not, we stop straight away.
        if (response === false) {
            return;
        }

        console.log("Checking for any supported webmail...");

        // Roundcube.
        if (checkAllElements(["rcmbtn100", "rcmbtn101", "rcmbtn102"])) {
            console.log("Roundcube detected!");
            roundcube();
        // Rainloop.
        } else if (checkAllElements(rainloopElements)) {
            console.log("Rainloop detected!");
            rainloop();
        }
    });
});
