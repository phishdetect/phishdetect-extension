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

var Config = function() {
    // Functions to set and get the PhishDetect Node.
    this.getNode = function() {
        var server = localStorage.getItem("cfg_node");
        if (!server.startsWith("http")) {
            return "https://" + server;
        }
        return server;
    }
    this.setNode = function(domain) {
        localStorage.setItem("cfg_node", domain);
    }
    this.getDefaultNode = function() {
        return NODE_DEFAULT_URL;
    }
    this.restoreDefaultNode = function() {
        localStorage.setItem("cfg_node", NODE_DEFAULT_URL);
    }

    // Functions to get Node URLs.
    this.getLinkCheckURL = function() {
        return this.getNode() + NODE_GUI_LINK_CHECK;
    }
    this.getReviewURL = function() {
        return this.getNode() + NODE_GUI_REVIEW;
    }
    this.getIndicatorsURL = function() {
        return this.getNode() + NODE_API_INDICATORS_FETCH_PATH;
    }
    this.getEventsURL = function() {
        return this.getNode() + NODE_API_EVENTS_ADD_PATH;
    }
    this.getRawURL = function() {
        return this.getNode() + NODE_API_RAW_ADD;
    }

    // Flag for reporting events to Node.
    this.getReport = function() {
        return localStorage.getItem("cfg_report") == "true" ? true : false;
    }
    this.setReport = function(value) {
        localStorage.setItem("cfg_report", value);
    }

    // Flag for Gmail integration.
    this.getWebmails = function() {
        return localStorage.getItem("cfg_webmails") == "true" ? true : false;
    }
    this.setWebmails = function(value) {
        localStorage.setItem("cfg_webmails", value);
    }

    // Indicators stored in local storage.
    this.getIndicators = function() {
        return localStorage.getItem("cfg_indicators");
    }
    this.setIndicators = function(value) {
        localStorage.setItem("cfg_indicators", value);
    }

    // User contact details.
    this.getContact = function() {
        return localStorage.getItem("cfg_contact");
    }
    this.setContact = function(value) {
        localStorage.setItem("cfg_contact", value);
    }

    // List of email IDs that have already been reported (to avoid duplication).
    this.getReportedEmails = function() {
        return JSON.parse(localStorage.getItem("cfg_reported_emails"));
    }
    this.addReportedEmail = function(value) {
        var emails = this.getReportedEmails();
        emails.push(value);
        localStorage.setItem("cfg_reported_emails", JSON.stringify(emails));
    }
    // List of email IDs that have already be shared (to avoid duplication).
    this.getSharedEmails = function() {
        return JSON.parse(localStorage.getItem("cfg_shared_emails"));
    }
    this.addSharedEmail = function(value) {
        var emails = this.getSharedEmails();
        emails.push(value);
        localStorage.setItem("cfg_shared_emails", JSON.stringify(emails));
    }
}

var cfg = new Config();
