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

"use strict";

function addScript(src) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.extension.getURL(src);
    (document.body || document.head || document.documentElement).appendChild(script);
}

addScript("js/config.js");
addScript("dist/phishdetect.js");
