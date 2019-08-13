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

document.addEventListener("DOMContentLoaded", function() {
    $("#server").val(cfg.getNode());
});

$("form").submit(function() {
    var node = $("#server").val().trim();
    if (node != "") {
        cfg.setNode(node);
    }

    var apiKey = $("#key").val().trim()
    if (apiKey != "") {
        console.log("NEW API KEY");
        cfg.setAPIKey(apiKey);
        // chrome.runtime.sendMessage({method: "auth", apiKey: apiKey}, function(response) {
        //     var promise = response;
        //     promise.then((response) => response.json())
        //     .then(function(data) {
        //         console.log("GOOD API KEY");
        //     })
        //     .catch(error => {
        //         console.log("BAD API KEY");
        //     });
        // });
        $("#container").html("Saved!");
    } else {
        console.log("NO API KEY");
        $("#errors").html("You did not provide a valid API key.");
    }
});