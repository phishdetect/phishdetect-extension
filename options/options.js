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

function loadOptions() {
    document.getElementById("server").value = cfg.getNode();
    document.getElementById("report").checked = cfg.getReport();
    document.getElementById("gmail").checked = cfg.getGmail();
}

function saveOptions() {
	let node = document.querySelector("#server").value.trim();
	if (node != "") {
		cfg.setNode(node);
	}
    cfg.setReport(document.querySelector("#report").checked);
    cfg.setGmail(document.querySelector("#gmail").checked);
    loadOptions();
}

function restoreDefaults() {
    cfg.restoreDefaultNode();
    cfg.setReport(true);
    loadOptions();
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#restoreDefaults").addEventListener("click", restoreDefaults);
