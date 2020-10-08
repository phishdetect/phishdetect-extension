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
import { ApiKeySaved } from "../../components/ApiKey.js";

$("form").submit(function(event) {
    event.preventDefault();
    const node = $("#server").val().trim();
    if (node != "" && cfg.getNode() != node) {
        // Set request to background to update node and reset config.
        chrome.runtime.sendMessage({method: "updateNode", node: node}, function(response) {
            ReactDOM.render(React.createElement(OptionsSaved), container.get(0));
        });
    }

    const apiKey = $("#key").val().trim();
    if (apiKey != "") {
        cfg.setApiKey(apiKey);

        chrome.runtime.sendMessage({method: "updateConfiguration", config: cfg.config}, function(response) {
            const container = $("#container").empty();
            ReactDOM.render(React.createElement(ApiKeySaved), container.get(0));
        });
    } else {
        $("#errors").text(chrome.i18n.getMessage("apikeyErrorSecretToken"));
    }
});

function loadContent() {
    const link = cfg.getRegisterURL();
    $("#link-register").attr("href", link);
    $("#server").val(cfg.getNode());
}

document.addEventListener("DOMContentLoaded", cfg.loadFromBackground(loadContent));
