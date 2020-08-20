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

import React from 'react';
import ReactDOM from 'react-dom';
import { ApiKeySaved } from '../../components/ApiKey.js'

$("form").submit(function(event) {
    event.preventDefault();
    let node = $("#server").val().trim();
    if (node != "") {
        cfg.setNode(node);
    }

    let apiKey = $("#key").val().trim()
    if (apiKey != "") {
        cfg.setApiKey(apiKey);

        let container = $("#container").empty();
        ReactDOM.render(React.createElement(ApiKeySaved), container.get(0));
    } else {
        $("#errors").text(chrome.i18n.getMessage("apikeyErrorSecretToken"));
    }
});

document.addEventListener("DOMContentLoaded", function() {
    let link = cfg.getRegisterURL();
    $("#link-register").attr("href", link);
    $("#server").val(cfg.getNode());
});
