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

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile } from "@fortawesome/free-solid-svg-icons";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export function PopupActivate(props) {
    return (
        <div>
            <p className="mt-4 leading-normal">
                {chrome.i18n.getMessage("popupTokenRequired") + " "}
                <a target="_blank" href="/ui/register/register.html">
                    {chrome.i18n.getMessage("popupActivate")}
                </a> <FontAwesomeIcon icon={faSmile} className="text-blue" />
            </p>
        </div>
    );
}

export function PopupStatusWarning(props) {
    return (
        <div>
            <p className={"space-x-2 pd-status-" + props.color} role="alert">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{chrome.i18n.getMessage(props.message)}</span>
            </p>
        </div>
    );
}
