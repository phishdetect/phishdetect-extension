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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile } from "@fortawesome/free-solid-svg-icons";

export function PopupActivate(props) {
    return (
        <div>
            <p className="mt-4 leading-normal">
                {chrome.i18n.getMessage("popupTokenRequired") + " "}
                <a target="_blank" href="/ui/apikey/apikey.html">
                    {chrome.i18n.getMessage("popupActivate")}
                </a> <FontAwesomeIcon icon={faSmile} className="text-blue" />
            </p>
        </div>
    );
}
