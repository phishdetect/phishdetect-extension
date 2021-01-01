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

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == "alarmUpdateIndicators") {
        updateIndicators();
    } else if (alarm.name == "alarmUpdateConfig") {
        // This will update the configuration in case the server config
        // changes and it would no longer require an API key.
        cfg.fetchNodeConfig(setStatusOnline, setStatusOffline);
    }
});

chrome.alarms.create("alarmUpdateIndicators", {periodInMinutes: INDICATORS_UPDATE_FREQUENCY});
chrome.alarms.create("alarmUpdateConfig", {periodInMinutes: CONFIG_UPDATE_FREQUENCY});
