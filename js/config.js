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

class Config {

    //=========================================================================
    // Local Storage
    //=========================================================================
    initLocalStorage() {
        console.log("Initializing storage...");

        if (localStorage.cfg_node === undefined) {
            localStorage.cfg_node = NODE_DEFAULT_URL;
        }
        if (localStorage.cfg_api_key === undefined) {
            localStorage.cfg_api_key = "";
        }
        if (localStorage.cfg_node_enforce_user_auth === undefined) {
            localStorage.cfg_node_enforce_user_auth = true;
        }
        if (localStorage.cfg_node_enable_analysis === undefined) {
            localStorage.cfg_node_enable_analysis = false;
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

        console.log("Storage initialization completed.");
    }

    //=========================================================================
    // Node
    //=========================================================================
    getNode() {
        var address = localStorage.getItem("cfg_node");
        if (!address.startsWith("http")) {
            return "https://" + address;
        }
        return address;
    }
    setNode(newAddress) {
        var currentAddress = this.getNode()
        if (newAddress == currentAddress) {
            return;
        }

        console.log("Attention! Reconfiguring PhishDetect Node...");

        // If we are changing the server, we also reset all the localStorage.
        localStorage.clear();
        // Then we set the new node.
        localStorage.setItem("cfg_node", newAddress);
        // We reinitialize the storage.
        this.initLocalStorage();
        // And we pull the new config.
        this.fetchNodeConfig(function() {});
    }
    restoreDefaultNode() {
        this.setNode(NODE_DEFAULT_URL);
    }

    //=========================================================================
    // API Keys
    //=========================================================================
    getApiKey() {
        return localStorage.getItem("cfg_api_key");
    }
    setApiKey(newAPIKey) {
        localStorage.setItem("cfg_api_key", newAPIKey);
    }

    //=========================================================================
    // Node configuration
    //=========================================================================
    fetchNodeConfig(callback) {
        console.log("Fetching configuration from Node...");

        var url = this.getConfigURL()

        fetch(url)
        .then((response) => response.json())
        .then(data => {
            this.setNodeEnableAnalysis(data.disable_analysis);
            this.setNodeEnforceUserAuth(data.enforce_user_auth);

            console.log("Configuration fetched successfully.");
        })
        .then(function() {
            callback();
        })
        .catch(error => {
            console.log(error);
        });
    }
    getNodeEnableAnalysis() {
        return localStorage.getItem("cfg_node_enable_analysis") == "true" ? true : false;
    }
    setNodeEnableAnalysis(value) {
        localStorage.setItem("cfg_node_enable_analysis", value);
    }
    getNodeEnforceUserAuth() {
        return localStorage.getItem("cfg_node_enforce_user_auth") == "true" ? true : false;
    }
    setNodeEnforceUserAuth(value) {
        localStorage.setItem("cfg_node_enforce_user_auth", value);
    }

    //=========================================================================
    // Node URLs
    //=========================================================================
    getConfigURL() {
        return this.getNode() + NODE_API_CONFIG;
    }
    getAuthURL(apiKey) {
        return this.getNode() + NODE_API_AUTH + "?key=" + apiKey;
    }
    getLinkCheckURL() {
        var url = this.getNode() + NODE_GUI_LINK_CHECK;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getReviewURL() {
        var url = this.getNode() + NODE_GUI_REVIEW;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getReportURL() {
        var url = this.getNode() + NODE_GUI_REPORT;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getIndicatorsURL() {
        var url = this.getNode() + NODE_API_INDICATORS_FETCH_PATH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getRecentIndicatorsURL() {
        var url = this.getNode() + NODE_API_RECENT_INDICATORS_FETCH_PATH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getEventsURL() {
        var url = this.getNode() + NODE_API_EVENTS_ADD_PATH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getRawURL() {
        var url = this.getNode() + NODE_API_RAW_ADD;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }

    //=========================================================================
    // Report (events).
    // TODO: rename this to something more descriptive.
    //=========================================================================
    getReport() {
        return localStorage.getItem("cfg_report") == "true" ? true : false;
    }
    setReport(value) {
        localStorage.setItem("cfg_report", value);
    }

    //=========================================================================
    // Webmails integration.
    // TODO: rename this to something more descriptive.
    //=========================================================================
    getWebmails() {
        return localStorage.getItem("cfg_webmails") == "true" ? true : false;
    }
    setWebmails(value) {
        localStorage.setItem("cfg_webmails", value);
    }

    //=========================================================================
    // Indicators
    //=========================================================================
    getIndicators() {
        return JSON.parse(localStorage.getItem("cfg_indicators"));
    }
    setIndicators(value) {
        // If the domains and emails are undefined, something went wrong.
        if (value.domains === undefined || value.emails === undefined) {
            return;
        }

        localStorage.setItem("cfg_indicators", JSON.stringify(value));
    }

    //=========================================================================
    // Update time
    //=========================================================================
    getLastFullUpdateTime() {
        var lastUpdate = localStorage.getItem("cfg_last_update")
        if (lastUpdate == "") {
            return null;
        }

        return Date(lastUpdate);
    }
    setLastFullUpdateTime() {
        localStorage.setItem("cfg_last_update", getCurrentISODate())
    }

    //=========================================================================
    // User contact details
    //=========================================================================
    getContact() {
        return localStorage.getItem("cfg_contact");
    }
    setContact(value) {
        localStorage.setItem("cfg_contact", value);
    }

    //=========================================================================
    // Emails that were detected in webmail
    //=========================================================================
    getDetectedEmails() {
        return JSON.parse(localStorage.getItem("cfg_detected_emails"));
    }
    addDetectedEmail(value) {
        var emails = getDetectedEmails();
        emails.push(value);
        localStorage.setItem("cfg_detected_emails", JSON.stringify(emails));
    }

    //=========================================================================
    // Emails that were reported by the user to the Node
    //=========================================================================
    getReportedEmails() {
        return JSON.parse(localStorage.getItem("cfg_reported_emails"));
    }
    addReportedEmail(value) {
        var emails = getReportedEmails();
        emails.push(value);
        localStorage.setItem("cfg_reported_emails", JSON.stringify(emails));
    }
}

var cfg = new Config();
