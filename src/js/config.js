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

class Config {

    constructor() {
        this.config = {};
        this.indicators = {};
        // Global status for the API server reachablity and auth.
        this.status = null;
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
        };

        var config_options = {};

        // If localStorage settings exist, use defaults to iterate through
        // existing options, and retrieve the settings from localStorage.
        if (localStorage.getItem("cfg_node") !== null) {
            config_options = this.migrateLocalStorage(config_defaults);
        } else {
            // Otherwise we just deep copy the default settings.
            for (const [default_key, default_value] of Object.entries(config_defaults)) {
                config_options[default_key] = default_value;
            }
        }

        chrome.storage.sync.get({config: {}}, result => {
            for (const [config_key, config_value] of Object.entries(config_options)) {
                if (result["config"][config_key] == undefined) {
                    result["config"][config_key] = config_value;
                }
            }

            // Store the config values on the Config object.
            this.config = result["config"];
            // Persist config with storage API.
            chrome.storage.sync.set({config: this.config});

            console.log("Storage initialization completed.");

            // Load indicators with async API.
            return chrome.storage.local.get({indicators: {domains: [], emails: [],}}, (result) => {
                console.log("Loaded indicators from storage.");
                this.indicators = result.indicators;
                configCallback();
            });
        });
    }

    migrateLocalStorage(config_defaults) {
        console.log("Migrating configuration from localStorage...");

        var config_options = {};
        // Migrate config from localstorage to storage API
        for (const config_key in config_defaults) {
            const existing_value = localStorage.getItem(config_key);
            if (existing_value != undefined) {
                config_options[config_key] = existing_value;
            }
        }

        // Reset last update to force a full indicator update after extension
        // upgrade.
        config_options.cfg_last_update = null;

        // Clear localStorage as it is not used anymore.
        localStorage.clear();

        return config_options;
    }

    getItem(item_name){
        // Retrieve a config value from the config object.
        return this.config[item_name];
    }

    setItem(item_name, item_value) {
        // Update a config value and persist to storage.
        this.config[item_name] = item_value;
        chrome.storage.sync.set({config: this.config});
    }

    loadFromBackground(config_loaded_callback) {
        // Lightweight method to populate Config data from the background page
        // for use in the UI.
        chrome.runtime.sendMessage({method: "loadConfiguration"}, function(response) {
            // Got config state from background page
            cfg.config = response.config;
            cfg.status = response.status;
            config_loaded_callback();
        });
    }

    updateConfig(config) {
        // Reload background page config and persist to storage object when
        // changes made from UI.
        this.config = config;
        chrome.storage.sync.set({config: this.config});
    }

    clearStorage() {
        this.config = {};
        this.indicators = {};
        chrome.storage.sync.clear();
        chrome.storage.local.clear();
        // Clear legacy localStorage if it still exist.
        localStorage.clear();
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
    setNode(node, api_key) {
        const currentAddress = this.getNode();
        if (node == currentAddress) {
            return;
        }

        console.log("Attention! Reconfiguring PhishDetect Node...");

        // If we are changing the server, we also reset all the storage.
        this.clearStorage();
        // We reinitialize the storage.
        this.initStorage(() => {
            // Then we set the new node.
            this.setItem("cfg_node", node);
            if (api_key) {
                this.setApiKey(api_key);
            }
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

        let url = this.getConfigURL();

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
        return this.getItem("cfg_node_enable_analysis");
    }
    setNodeEnableAnalysis(value) {
        this.setItem("cfg_node_enable_analysis", value);
    }
    getNodeEnforceUserAuth() {
        return this.getItem("cfg_node_enforce_user_auth");
    }
    setNodeEnforceUserAuth(value) {
        this.setItem("cfg_node_enforce_user_auth", value);
    }

    //=========================================================================
    // Node URLs
    //=========================================================================
    addAuthToURL(url) {
        if (this.getNodeEnforceUserAuth() == true) {
            url += "?key=" + this.getApiKey();
        }
        return url;
    }
    getConfigURL() {
        return new URL(NODE_API_CONFIG_PATH, this.getNode()).href;
    }
    getAuthURL() {
        let url = new URL(NODE_API_AUTH, this.getNode()).href;
        return this.addAuthToURL(url);
    }
    getRegisterURL() {
        return new URL(NODE_GUI_REGISTER, this.getNode()).href;
    }
    getLinkCheckURL(link) {
        return new URL(NODE_GUI_LINK_CHECK + link + "/", this.getNode()).href;
    }
    getReviewURL(ioc) {
        let url = new URL(NODE_GUI_REVIEW + ioc + "/", this.getNode()).href;
        return this.addAuthToURL(url);
    }
    getReportLinkURL(link) {
        let url = new URL(NODE_GUI_REPORT + link + "/", this.getNode()).href;
        return this.addAuthToURL(url);
    }
    getIndicatorsURL() {
        let url = new URL(NODE_API_INDICATORS_FETCH_PATH, this.getNode()).href;
        return this.addAuthToURL(url);
    }
    getRecentIndicatorsURL() {
        let url = new URL(NODE_API_RECENT_INDICATORS_FETCH_PATH, this.getNode()).href;
        return this.addAuthToURL(url);
    }
    getAlertsAddURL() {
        let url = new URL(NODE_API_ALERTS_ADD_PATH, this.getNode()).href;
        return this.addAuthToURL(url);
    }
    getReportsAddURL() {
        let url = new URL(NODE_API_REPORTS_ADD_PATH, this.getNode()).href;
        return this.addAuthToURL(url);
    }

    //=========================================================================
    // Send alerts.
    //=========================================================================
    getSendAlerts() {
        return this.getItem("cfg_send_alerts");
    }
    setSentAlerts(value) {
        this.setItem("cfg_send_alerts", value);
    }

    //=========================================================================
    // Webmails integration.
    //=========================================================================
    getWebmailsIntegration() {
        return this.getItem("cfg_webmails");
    }
    setWebmailsIntegration(value) {
        this.setItem("cfg_webmails", value);
    }

    //=========================================================================
    // Indicators
    //=========================================================================
    getIndicators() {
        return this.indicators;
    }

    setIndicators(value, callback) {
        // If the domains and emails are undefined, something went wrong.
        if (value.domains === undefined || value.emails === undefined) {
            console.error("Indicator list missing the domain or email field.");
            return;
        }

        this.indicators = value;
        return chrome.storage.local.set({indicators: value}, callback);
    }

    //=========================================================================
    // Update time
    //=========================================================================
    getLastFullUpdateTime() {
        const lastUpdate = this.getItem("cfg_last_update");
        if (lastUpdate == null) {
            return null;
        }

        return lastUpdate;
    }
    setLastFullUpdateTime() {
        this.setItem("cfg_last_update", getCurrentUTCDate());
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
        return this.getItem("cfg_detected_emails");
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
