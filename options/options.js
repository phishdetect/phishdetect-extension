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
    document.getElementById("gmail").checked = cfg.getGmail();

    let report = cfg.getReport();
    document.getElementById("report").checked = report;
    document.getElementById("contact").value = cfg.getContact();
    if (report) {
        document.getElementById("contactLabel").classList.remove("text-grey");
        document.getElementById("contact").disabled = false;
    } else {
        document.getElementById("contactLabel").classList.add("text-grey");
        document.getElementById("contact").disabled = true;
    }
}

function saveOptions() {
	let node = document.querySelector("#server").value.trim();
	if (node != "") {
		cfg.setNode(node);
	}
    let contact = document.querySelector("#contact").value.trim();
    if (contact != "") {
        cfg.setContact(contact);
    }
    cfg.setReport(document.querySelector("#report").checked);
    cfg.setGmail(document.querySelector("#gmail").checked);
    loadOptions();
}

function restoreDefaults() {
    cfg.restoreDefaultNode();
    cfg.setGmail(true);
    cfg.setReport(true);
    cfg.setContact("");
    loadOptions();
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#restoreDefaults").addEventListener("click", restoreDefaults);

document.querySelector("#report").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("contactLabel").classList.remove("text-grey");
        document.getElementById("contact").disabled = false;
    } else {
        document.getElementById("contactLabel").classList.add("text-grey");
        document.getElementById("contact").disabled = true;
    }
});
