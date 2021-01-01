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

function initSuccess() {
    console.log("PhishDetect init success");

    // First, we check if the server requires authorization, and if user
    // has yet provided an API key.
    if (checkKeySetIfNeeded()) {
        // If everything is fine, we launch an update of indicators.
        updateIndicators();
    }

    loadContextMenus();
}

function initFailure() {
    console.log("PhishDetect init failed!");
    setStatusOffline();
}

(function() {
    console.log("*** PhishDetect init ***");

    cfg.initStorage(() => {
        cfg.fetchNodeConfig(initSuccess, initFailure);
    });
})();
