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

function loadOptions() {
    $("#server").val(cfg.getNode());
    $("#toggleIntegrations").prop("checked", cfg.getWebmailsIntegration());

    if (cfg.status == "offline") {
    } else if (cfg.status == "unauthorized") {
    }

    const sendAlerts = cfg.getSendAlerts();
    $("#toggleReporting").prop("checked", cfg.getSendAlerts());
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

function saveOptions() {
    // cfg.setContact($("#contact").val().trim());
    cfg.setWebmailsIntegration($("#toggleIntegrations").is(":checked"));
    cfg.setSentAlerts($("#toggleReporting").is(":checked"));

    // Reload config on background page
    chrome.runtime.sendMessage({method: "updateConfiguration", config: cfg.config});
}

document.addEventListener("DOMContentLoaded", cfg.loadFromBackground(loadOptions));

$("#toggleIntegrations").change(function() {
    saveOptions();
});

$("#toggleReporting").change(function() {
    saveOptions();
    // if (this.checked) {
    //     $("#contactLabel").removeClass("text-gray-500");
    //     $("#contact").prop("disabled", false);
    // } else {
    //     $("#contactLabel").addClass("text-gray-500");
    //     $("#contact").prop("disabled", true);
    // }
});
