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
    if (localStorage.cfg_init === undefined) {
        localStorage.cfg_init = true;
    }
    if (localStorage.cfg_node === undefined) {
        localStorage.cfg_node = NODE_DEFAULT_URL;
    }
    if (localStorage.cfg_update_frequency === undefined) {
        localStorage.cfg_update_frequency = 30;
    }
    if (localStorage.cfg_indicators === undefined) {
        localStorage.cfg_indicators = JSON.stringify({});
    }
    if (localStorage.cfg_report === undefined) {
        localStorage.cfg_report = true;
    }
    if (localStorage.cfg_webmails === undefined) {
        localStorage.cfg_webmails = true;
    }
    if (localStorage.cfg_contact === undefined) {
        localStorage.cfg_contact = "";
    }
    if (localStorage.cfg_reported_emails === undefined) {
        localStorage.cfg_reported_emails = JSON.stringify([]);
    }
    if (localStorage.cfg_shared_emails === undefined) {
        localStorage.cfg_shared_emails = JSON.stringify([]);
    }
})();
