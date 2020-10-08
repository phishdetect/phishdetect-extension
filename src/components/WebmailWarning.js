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
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export default class WebmailWarning extends React.Component {
    getWarningText(alertType) {
        switch(alertType) {
        case "email_sender":
        case "email_sender_domain":
            return chrome.i18n.getMessage("webmailWarningSender");
        case "email_link":
            return chrome.i18n.getMessage("webmailWarningLinks");
        }
    }

    render() {
        return (
            <div id="phishdetect-warning" className="pd-webmail-warning"
                style={ {paddingTop: "1rem"} }>
                <span style={ {fontSize: "1.125rem"} }>
                    <FontAwesomeIcon icon={faExclamationTriangle} /> <b>PhishDetect</b>
                    {" "}
                    {chrome.i18n.getMessage("webmailWarningWarning")}
                </span>
                <br />
                {chrome.i18n.getMessage("webmailWarningPleaseBeCautious")}
                {" "}
                {this.getWarningText(this.props.alertType)}
                {" "}
                {chrome.i18n.getMessage("webmailWarningHelp")}
                {" "}
                <a style={{textDecoration: "none"}} href="https://phishdetect.io/help/">
                    <span style={{color: "#6cb2eb"}}>
                        <b>phishdetect.io/help</b>
                    </span>
                </a>
            </div>
        );
    }
}
