// Copyright (c) 2018-2020 Claudio Guarnieri.
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

    constructor() {
        this.config = {};
        this.indicators = {};
    }

    //=========================================================================
    // Storage
    //=========================================================================
    initStorage(configCallback) {
        console.log("Initializing storage...");

        const config_defaults = {
            cfg_node: NODE_DEFAULT_URL,
            cfg_api_key: "",
            cfg_node_enforce_user_auth: false,
            cfg_node_enable_analysis: false,
            cfg_node_contacts: "",
            cfg_last_update: null,
            cfg_send_alerts: true,
            cfg_webmails: true,
            cfg_contact: "",
            cfg_detected_emails: [],
            cfg_reported_emails: [],
            cfg_last_error: null,
        }

        // Migrate options from localStorage if set
        if (localStorage.getItem("cfg_node")) {
            config_defaults = migrateLocalStorage(config_defaults)
        }

        chrome.storage.sync.get({config: {}}, result => {
            // Set defaults for all config options
            for (let [config_key, config_value] of Object.entries(config_defaults)) {
                if (result["config"][config_key] == undefined) {
                    result["config"][config_key] = config_value
                }
            }

            // Store the config values on the Config object.
            this.config = result["config"]

            // Persist config with storage API
            chrome.storage.sync.set({config: this.config})
            console.log("Storage initialization completed.");

            // Load indicators with async API
            return chrome.storage.local.get({indicators: { domains: [], emails: [], } }, (result) => {
                console.log("Loaded indicators from storage")
                this.indicators = result.indicators
                configCallback()
            })
        })
    }

    migrateLocalStorage(config_options) {
        // Migirate config from localstorage to storage API
        for (let config_key in Object.keys(config_options)) {
            var exisiting_value = localStorage.getItem(config_key)
            if (exisiting_value != undefined) {
                config_options[config_key] = exisiting_value
            }
        }
        // Reset last update to force a full indicator update after extension upgrade.
        config_options.cfg_last_update = null

        // Clear localStorage as it is not used anymore.
        localStorage.clear()
    }

    getItem(item_name){
        // Retrieve a config value from the config object.
        return this.config[item_name]
    }

    setItem(item_name, item_value) {
        // Update a config value and persist to storage
        this.config[item_name] = item_value
        chrome.storage.sync.set({config: this.config})
    }

    loadFromBackground(config_loaded_callback) {
        // Lightweight method to populate Config data from the background page for use in the UI.
        chrome.runtime.sendMessage({method: "loadConfiguration"}, function(response) {
            // Got config state from background page
            cfg.config = response
            config_loaded_callback()
        });
    }

    updateConfig(config) {
        // Reload background page config and persist to storage object when changes made from UI
        this.config = config
        chrome.storage.sync.set({config: this.config})
    }

    clearStorage() {
        this.config = {}
        chrome.storage.sync.clear()
        chrome.storage.local.clear()
        localStorage.clear()  // Clear legacy localStorage if it still exist
    }

    //=========================================================================
    // Node
    //=========================================================================
    getNode() {
        const address = this.getItem("cfg_node");
        if (address && !address.startsWith("http")) {
            return "https://" + address;
        }
        return address;
    }
    setNode(value) {
        const currentAddress = this.getNode()
        if (value == currentAddress) {
            return;
        }

        console.log("Attention! Reconfiguring PhishDetect Node...");

        // If we are changing the server, we also reset all the storage.
        this.clearStorage();
        // We reinitialize the storage.
        this.initStorage(() => {
            // Then we set the new node.
            this.setItem("cfg_node", value);
            // And we pull the new config.
            this.fetchNodeConfig(initSuccess, initFailure);
        });
    }

    restoreDefaultNode() {
        this.setNode(NODE_DEFAULT_URL);
    }

    //=========================================================================
    // API Keys
    //=========================================================================
    getApiKey() {
        return this.getItem("cfg_api_key");
    }
    setApiKey(value) {
        this.setItem("cfg_api_key", value);
    }

    //=========================================================================
    // Node configuration
    //=========================================================================
    fetchNodeConfig(success, failure) {
        console.log("Fetching configuration from Node...");

        let url = this.getConfigURL()

        fetch(url)
        .then((response) => response.json())
        .then(data => {
            this.setNodeEnableAnalysis(data.enable_analysis);
            this.setNodeEnforceUserAuth(data.enforce_user_auth);

            console.log("Configuration fetched successfully.");
            // Calling success callback if all worked.
            success();
        })
        .catch(error => {
            console.log("ERROR: Connection failed: " + error);
            // Calling failure callback if errored.
            failure();
        });
    }
    getNodeEnableAnalysis() {
        return this.getItem("cfg_node_enable_analysis")
    }
    setNodeEnableAnalysis(value) {
        this.setItem("cfg_node_enable_analysis", value);
    }
    getNodeEnforceUserAuth() {
        return this.getItem("cfg_node_enforce_user_auth")
    }
    setNodeEnforceUserAuth(value) {
        this.setItem("cfg_node_enforce_user_auth", value);
    }

    //=========================================================================
    // Node URLs
    //=========================================================================
    getConfigURL() {
        return this.getNode() + NODE_API_CONFIG_PATH;
    }
    getAuthURL() {
        let url = this.getNode() + NODE_API_AUTH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getRegisterURL() {
        return this.getNode() + NODE_GUI_REGISTER;
    }
    getLinkCheckURL(link) {
        return this.getNode() + NODE_GUI_LINK_CHECK + link + "/";
    }
    getReviewURL(ioc) {
        let url = this.getNode() + NODE_GUI_REVIEW;
        url += ioc + "/";
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getSendAlertsURL(link) {
        let url = this.getNode() + NODE_GUI_REPORT;
        url += link + "/";
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getIndicatorsURL() {
        let url = this.getNode() + NODE_API_INDICATORS_FETCH_PATH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getRecentIndicatorsURL() {
        let url = this.getNode() + NODE_API_RECENT_INDICATORS_FETCH_PATH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getEventsURL() {
        let url = this.getNode() + NODE_API_ALERTS_ADD_PATH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }
    getSendAlertssURL() {
        let url = this.getNode() + NODE_API_REPORTS_ADD_PATH;
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey()
        }
        return url;
    }

    //=========================================================================
    // Send alerts.
    //=========================================================================
    getSendAlerts() {
        return this.getItem("cfg_send_alerts")
    }
    setSentAlerts(value) {
        this.setItem("cfg_send_alerts", value);
    }

    //=========================================================================
    // Webmails integration.
    // TODO: rename this to something more descriptive.
    //=========================================================================
    getWebmails() {
        return this.getItem("cfg_webmails")
    }
    setWebmails(value) {
        this.setItem("cfg_webmails", value);
    }

    //=========================================================================
    // Indicators
    //=========================================================================
    getIndicators() {
        return this.indicators
    }

    setIndicators(value, callback) {
        // If the domains and emails are undefined, something went wrong.
        if (value.domains === undefined || value.emails === undefined) {
            return;
        }

        this.indicators = value
        return chrome.storage.local.set({cfg_indicators: value}, callback)
    }

    //=========================================================================
    // Update time
    //=========================================================================
    getLastFullUpdateTime() {
        const lastUpdate = this.getItem("cfg_last_update")
        if (lastUpdate == null) {
            return null;
        }

        return Date(lastUpdate);
    }
    setLastFullUpdateTime() {
        this.setItem("cfg_last_update", getCurrentISODate())
    }

    //=========================================================================
    // User contact details
    //=========================================================================
    getUserContact() {
        return this.getItem("cfg_contact");
    }
    setContact(value) {
        this.setItem("cfg_contact", value);
    }

    //=========================================================================
    // Emails that were detected in webmail
    //=========================================================================
    getDetectedEmails() {
        return this.getItem("cfg_detected_emails")
    }
    addDetectedEmail(value) {
        let emails = this.getDetectedEmails();
        emails.push(value);
        this.setItem("cfg_detected_emails", emails);
    }

    //=========================================================================
    // Emails that were reported by the user to the Node
    //=========================================================================
    getReportedEmails() {
        return this.getItem("cfg_reported_emails");
    }
    addReportedEmail(value) {
        let emails = this.getReportedEmails();
        emails.push(value);
        this.setItem("cfg_reported_emails", emails);
    }
}

const cfg = new Config();
