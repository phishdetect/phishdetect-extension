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

// Check if configuration values are set. If not, create a default
// configuration.
(function() {
    if (localStorage.cfg_node === undefined) {
        localStorage.cfg_node = NODE_DEFAULT_URL;
    }
    if (localStorage.cfg_node_disable_analysis === undefined) {
        localStorage.cfg_node_disable_analysis = false;
    }
    if (localStorage.cfg_node_contacts === undefined) {
        localStorage.cfg_node_contacts = "";
    }
    if (localStorage.cfg_update_frequency === undefined) {
        localStorage.cfg_update_frequency = 30;
    }
    if (localStorage.cfg_indicators === undefined) {
        localStorage.cfg_indicators = JSON.stringify({});
    }
    if (localStorage.cfg_last_update === undefined) {
        localStorage.cfg_last_update = "";
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

// We connect to the Node to pull the configuration details of the server
// and initialize the local configuration for it.
(function() {
    console.log("Fetching config...");

    var url = localStorage.getItem("cfg_node") + NODE_API_CONFIG;

    fetch(url)
    .then((response) => response.json())
    .then(function(data) {
        localStorage.setItem("cfg_node_disable_analysis", data.disable_analysis);

        var contacts = data.operators_contacts;
        if (contacts === undefined || contacts === null) {
            contacts = "";
        }
        localStorage.setItem("cfg_node_contacts", contacts);
    })
    .catch(error => {
        console.log(error);
    })
})();
