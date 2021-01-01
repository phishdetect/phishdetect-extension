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

import React from "react";
import ReactDOM from "react-dom";
import { OptionsSaved, OptionsWarning } from "../../components/Options.js";

function loadOptions() {
    $("#server").val(cfg.getNode());
    $("#webmails").prop("checked", cfg.getWebmailsIntegration());

    if (cfg.status == "offline") {
        ReactDOM.render(React.createElement(OptionsWarning, {message: "serverOfflineFormError", color: "yellow"}), $("#nodeError").get(0));
    } else if (cfg.status == "unauthorized") {
        ReactDOM.render(React.createElement(OptionsWarning, {message: "serverUnauthorizedWarning", color: "red"}), $("#keyError").get(0));
    }

    const sendAlerts = cfg.getSendAlerts();
    $("#sendAlerts").prop("checked", cfg.getSendAlerts());
    $("#contact").val(cfg.getUserContact());
    if (sendAlerts) {
        $("#contactLabel").removeClass("text-gray-500");
        $("#contact").prop("disabled", false);
    } else {
        $("#contactLabel").addClass("text-gray-500");
        $("#contact").prop("disabled", true);
    }

    $("#key").val(cfg.getApiKey());
    if (!cfg.getNodeEnforceUserAuth()) {
        $("#keySection").hide();
    }
}

function saveOptions(event) {
    event.preventDefault();
    const node = $("#server").val().trim();
    var key = $("#key").val().trim();
    if (node != "" && cfg.getNode() != node) {
        // Set request to background to update node and reset config.
        const container = $("#container").empty();
        chrome.runtime.sendMessage({method: "updateNode", node: node, key: key}, function(response) {
            ReactDOM.render(React.createElement(OptionsSaved), container.get(0));
        });
    } else {
        cfg.setApiKey(key);
        cfg.setContact($("#contact").val().trim());
        cfg.setSentAlerts($("#sendAlerts").is(":checked"));
        cfg.setWebmailsIntegration($("#webmails").is(":checked"));

        // Reload config on background page
        const container = $("#container").empty();
        chrome.runtime.sendMessage({method: "updateConfiguration", config: cfg.config}, function(response) {
            ReactDOM.render(React.createElement(OptionsSaved), container.get(0));
            // Update indicators in background script after we have potential edited API key.
            chrome.runtime.sendMessage({method: "updateIndicators"});
        });
    }
}

function restoreDefaults() {
    $("#server").val(NODE_DEFAULT_URL);
    $("#key").val("");
    $("#webmails").prop("checked", true);
    $("#sendAlerts").prop("checked", true);
    $("#contact").val("");
}

document.addEventListener("DOMContentLoaded", cfg.loadFromBackground(loadOptions));
$("#saveOptions").click(saveOptions);
$("#restoreDefaults").click(restoreDefaults);

$("#sendAlerts").change(function() {
    if (this.checked) {
        $("#contactLabel").removeClass("text-gray-500");
        $("#contact").prop("disabled", false);
    } else {
        $("#contactLabel").addClass("text-gray-500");
        $("#contact").prop("disabled", true);
    }
});
