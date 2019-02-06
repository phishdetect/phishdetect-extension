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

(function() {
    if (typeof localStorage.cfg_init === "undefined") {
        localStorage.cfg_init = true;
        localStorage.cfg_node = NODE_DEFAULT_URL;
        localStorage.cfg_update_frequency = 30;
        localStorage.cfg_indicators = JSON.stringify({});
        localStorage.cfg_report = true;
        localStorage.cfg_gmail = true;
        localStorage.cfg_contact = "";
    }
})();
