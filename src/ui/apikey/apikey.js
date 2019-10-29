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

$("form").submit(function() {
    var node = $("#server").val().trim();
    if (node != "") {
        cfg.setNode(node);
    }

    var apiKey = $("#key").val().trim()
    if (apiKey != "") {
        cfg.setApiKey(apiKey);

        $("#container").empty().append(
            $("<div class=\"text-center\">")
                .append($("<i class=\"fas fa-check-circle text-5xl text-green\">"))
                .append($("<div class=\"mt-4\">")
                    .text(chrome.i18n.getMessage("apikeySaved"))
                )
        );
    } else {
        $("#errors").text(chrome.i18n.getMessage("apikeyErrorSecretToken"));
    }
});

document.addEventListener("DOMContentLoaded", function() {
    var link = cfg.getRegisterURL();
    $("#link-register").attr("href", link);
    $("#server").val(cfg.getNode());
});
