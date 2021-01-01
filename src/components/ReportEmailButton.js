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
const vex = require("vex-js");
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFish, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

function WebmailButton(props) {
    let { className, icon, message, onClick } = props;

    return (
        <span id="pd-report" className={`pd-webmail-button ${className}`} onClick={onClick}>
            <FontAwesomeIcon icon={icon} className="pd-webmail-button-icon" />
            {message}
        </span>
    );
}

export default class ReportEmailButton extends React.Component {
    constructor(props) {
        super(props);
        let { reported, uid } = props;
        this.state = { reported, uid };
    }

    onClick() {
        if (this.state.reported) {
            return;
        }
        vex.dialog.confirm({
            unsafeMessage: generateConfirmationDialog(),
            callback: this.onConfirm.bind(this)
        });
    }

    onConfirm(ok) {
        // If user clicked cancel, end.
        if (!ok) {
            return;
        }

        var promise = this.props.getEmailPromise();
        if (promise) {
            promise.then(this.onEmailPromiseResolved.bind(this));
        }
    }

    onEmailPromiseResolved(result) {
        this.setState({reported: true});

        chrome.runtime.sendMessage({
            method: "sendReport",
            reportType: "email",
            reportContent: result,
            identifier: this.state.uid,
        });
    }

    render() {
        if (this.state.reported) {
            return (
                <WebmailButton className="pd-webmail-reported" icon={faCheckCircle}
                    message={chrome.i18n.getMessage("reportEmailReportedAlready")} />
            );
        } else {
            return (
                <WebmailButton className="pd-webmail-report" icon={faFish}
                    message={chrome.i18n.getMessage("reportEmailReport")}
                    onClick={this.onClick.bind(this)} />
            );
        }
    }
}
