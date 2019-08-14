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

function base64encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

var url = location.href;
var html = document.documentElement.outerHTML;
var htmlEncoded = base64encode(html);
var actionURL = backend.replace("{{URL}}", base64encode(url));

var form = document.createElement("div");
form.innerHTML = "<div style=\"display: none;\">" +
"<form id=\"phishdetect-form\" action=\"" + actionURL + "\" method=\"POST\">" +
"<textarea name=\"html\">" + htmlEncoded + "</textarea>" +
"<textarea name=\"screenshot\">" + screenshot + "</textarea>" +
"</form>" +
"</div>";

document.body.appendChild(form);
document.getElementById("phishdetect-form").submit();

undefined;
