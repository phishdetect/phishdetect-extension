// Copyright (c) 2018 Claudio Guarnieri.
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

function sendEvent(eventType, indicator, hashed, targetContact) {
	var properties = {
		method: "POST",
		body: JSON.stringify({
			"type": eventType,
			"indicator": indicator,
			"hashed": hashed,
			"target_contact": targetContact,
		}),
		headers: {"Content-Type": "application/json"},
	};

	fetch(cfg.getEventsURL(), properties)
	.then((response) => response.json())
	.then(function(data) {
	})
	.catch(error => {
		console.log(error);
	})
}
