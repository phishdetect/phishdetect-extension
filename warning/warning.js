// Copyright (c) 2018 Claudio Guarnieri.
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

function loadContent() {
    let href = new URL(location.href);
    let url = href.searchParams.get("url");
    // TODO: This is a super hacky converstion to HTML entities.
    // https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript
    let cleanURL = url.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
        return '&#'+i.charCodeAt(0)+';';
    });

    document.getElementById("badURL").innerHTML = cleanURL;

    let takeMeAway = document.getElementById("takeMeAway");
    takeMeAway.href = "about:blank";
}

document.addEventListener("DOMContentLoaded", loadContent);
