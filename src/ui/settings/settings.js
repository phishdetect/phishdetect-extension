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

function toggleIntegrationsOn() {
    $("#labelIntegrations").removeClass("text-gray-500");
}

function toggleIntegrationsOff() {
    $("#labelIntegrations").addClass("text-gray-500");
}

function toggleReportingOn() {
    $("#labelReporting").removeClass("text-gray-500");
    $("#userContact").prop("disabled", false);
    $("#userContactSave").removeClass("pd-button-disabled")
    $("#userContactSave").addClass("pd-button-blue"); 
}

function toggleReportingOff() {
    $("#labelReporting").addClass("text-gray-500");
    $("#userContact").prop("disabled", true);
    $("#userContactSave").removeClass("pd-button-blue");
    $("#userContactSave").addClass("pd-button-disabled");
}

function loadOptions() {
    const node = cfg.getNode();
    if (node == NODE_DEFAULT_URL) {
        $("#divDefaultNetwork").show();
    } else {
        $("#customNetworkAddress").text(node);
        $("#customNetworkAdmin").text(cfg.getNodeAdminContacts());
        $("#divCustomNetwork").show();
    }

    const integration = cfg.getWebmailsIntegration();
    if (integration) {
        $("#toggleIntegrations").prop("checked", true);
        toggleIntegrationsOn();
    } else {
        toggleIntegrationsOff();
    }

    if (cfg.status == "offline") {
    } else if (cfg.status == "unauthorized") {
    }

    const sendAlerts = cfg.getSendAlerts();
    $("#userContact").val(cfg.getUserContact());

    if (sendAlerts) {
        $("#toggleReporting").prop("checked", true);
        toggleReportingOn();
    } else {
        toggleReportingOff();
    }

    $("#key").val(cfg.getApiKey());
    if (!cfg.getNodeEnforceUserAuth()) {
        $("#keySection").hide();
    }
}

function saveOptions() {
    cfg.setWebmailsIntegration($("#toggleIntegrations").is(":checked"));
    cfg.setSentAlerts($("#toggleReporting").is(":checked"));
    chrome.runtime.sendMessage({method: "updateConfiguration", config: cfg.config});
}

document.addEventListener("DOMContentLoaded", cfg.loadFromBackground(loadOptions));

$("#toggleIntegrations").change(function() {
    saveOptions();
    if (this.checked) {
        toggleIntegrationsOn();
    } else {
        toggleIntegrationsOff();
    }
});

$("#toggleReporting").change(function() {
    saveOptions();
    if (this.checked) {
        toggleReportingOn();
    } else {
        toggleReportingOff();
    }
});

$("#userContactSave").on("click", function() {
    if ($("#toggleReporting").is(":checked")) {
        cfg.setContact($("#userContact").val().trim());
        chrome.runtime.sendMessage({method: "updateConfiguration", config: cfg.config});
        $("#spanUserContact").append("<span class=\"text-turquoise ml-2\">Saved!</span>");
    }
})
