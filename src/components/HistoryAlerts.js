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

function HistoryAlert(props) {
    let { dateTime, url } = props;

    return (
        <div className="p-2 mb-2 border-l-4 border-gray-300">{dateTime} suspicious visit to <b>{url}</b></div>
    );
}

export default class HistoryAlerts extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            alerts: [],
        };
    }

    onClearAlerts() {
        this.setState({alerts: []});
    };

    onAddAlert(dateTime, url) {
        const alert = React.createElement(HistoryAlert, {dateTime, url});
        this.setState({
            alerts: this.state.alerts.concat(alert),
        });
    };

    render() {
        return (
            this.state.alerts.map(alert => {
                return alert;
            })
        );
    }
}
