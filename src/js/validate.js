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

"use strict";

const validator = require("validator");

window.isEmpty = function isEmpty(s) {
    return validator.isEmpty(s);
}

window.isEmail = function isEmail(s) {
    return validator.isEmail(s);
}

window.isIP = function isIP(s) {
    return validator.isIP(s);
}

window.normalizeName = function normalizeName(name) {
    return validator.escape(name);
}

window.normalizeEmail = function normalieEmail(email) {
    return validator.normalizeEmail(email);
}
