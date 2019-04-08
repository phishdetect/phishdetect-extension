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

"use strict";

const tldts = require("tldts");

window.getDomainFromURL = function getDomainFromURL(url) {
    let urlParsed = tldts.parse(url);
    return urlParsed.host;
}

window.getTopDomainFromURL = function getTopDomainFromURL(url) {
    let urlParsed = tldts.parse(url);
    return urlParsed.domain;
}

// This is a helper function to check hashes against the list of
// malicious indicators.
window.isElementInIndicators = function isElementInIndicators(elements, indicators) {
    for (let i=0; i<indicators.length; i++) {
        let indicator = indicators[i].toLowerCase();
        for (let j=0; j<elements.length; j++) {
            if (elements[j] == indicator) {
                return indicator;
            }
        }
    }

    return null;
}
