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

import React from "react";
import ReactDOM from "react-dom";
import { OptionsSaved } from "../../components/Options.js";

function loadOptions() {
    $("#server").val(cfg.getNode());
    $("#webmails").prop("checked", cfg.getWebmails());

    const sendAlerts = cfg.getSendAlerts();
    $("#sendAlerts").prop("checked", cfg.getSendAlerts());
    $("#contact").val(cfg.getContact());
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
    if (node != "" && cfg.getNode() != node) {
        // Set request to background to update node and reset config.
        const container = $("#container").empty();
        chrome.runtime.sendMessage({method: "updateNode", node: node}, function(response) {
            ReactDOM.render(React.createElement(OptionsSaved), container.get(0));
        });
    } else {
        const key = $("#key").val().trim();
        if (key != "") {
            cfg.setApiKey(key);
        }
        const contact = $("#contact").val().trim();
        if (contact != "") {
            cfg.setContact(contact);
        }
        cfg.setSentAlerts($("#sendAlerts").is(":checked"));
        cfg.setWebmails($("#webmails").is(":checked"));

        // Reload config on background page
        const container = $("#container").empty();
        chrome.runtime.sendMessage({method: "updateConfiguration", config: cfg.config}, function(response) {
            ReactDOM.render(React.createElement(OptionsSaved), container.get(0));
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
