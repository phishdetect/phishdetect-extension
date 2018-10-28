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

var Config = function() {
    // Functions to set and get the PhishDetect Node.
    this.getNode = function() {
        let server = localStorage.getItem("cfg_node");
        if (!server.startsWith("http")) {
            return "https://" + server;
        }
        return server;
    }
    this.setNode = function(domain) {
        localStorage.setItem("cfg_node", domain);
    }
    this.restoreDefaultNode = function() {
        localStorage.setItem("cfg_node", NODE_DEFAULT_URL);
    }

    // Functions to get Node URLs.
    this.getCheckURL = function() {
        let url = this.getNode() + NODE_CHECK_PATH;
        return url;
    }
    this.getIndicatorsURL = function() {
        let url = this.getNode() + NODE_API_INDICATORS_FETCH_PATH;
        return url;
    }
    this.getEventsURL = function() {
        let url = this.getNode() + NODE_API_EVENTS_ADD_PATH;
        return url;
    }

    // Flag for reporting events to Node.
    this.getReport = function() {
        return localStorage.getItem("cfg_report") == "true" ? true : false;
    }
    this.setReport = function(value) {
        localStorage.setItem("cfg_report", value);
    }

    // Flag for Gmail integration.
    this.getGmail = function() {
        return localStorage.getItem("cfg_gmail") == "true" ? true : false;
    }
    this.setGmail = function(value) {
        localStorage.setItem("cfg_gmail", value);
    }

    // Indicators stored in local storage.
    this.getIndicators = function() {
        return localStorage.getItem("cfg_indicators");
    }
    this.setIndicators = function(value) {
        localStorage.setItem("cfg_indicators", value);
    }
}

var cfg = new Config();
