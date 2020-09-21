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
